"use client"

import { useState, useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Define the structure of SSE messages
interface ScanProgressMessage {
  status: string
  progress: number
  details?: {
    path?: string
    current?: number
    total?: number
    title?: string
    [key: string]: any
  }
  complete?: boolean
}

interface ScanProgressProps {
  onComplete: () => void
  onCancel?: () => void
}

export function ScanProgress({ onComplete, onCancel }: ScanProgressProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [details, setDetails] = useState<ScanProgressMessage["details"]>({})
  const [error, setError] = useState<string | null>(null)
  const [scanSummary, setScanSummary] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const { toast } = useToast()

  // Function to start the scan
  const startScan = () => {
    setIsScanning(true)
    setProgress(0)
    setStatus("Initializing scan...")
    setDetails({})
    setError(null)
    setScanSummary(null)

    // Create EventSource for SSE connection
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is not configured")
      return
    }
    const eventSource = new EventSource(`${API_BASE_URL}/api/scanner/scan`)
    eventSourceRef.current = eventSource

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data: ScanProgressMessage = JSON.parse(event.data)
        
        setProgress(data.progress)
        setStatus(data.status)
        if (data.details) {
          setDetails(data.details)
        }

        // Handle scan completion
        if (data.complete) {
          setScanSummary(`Scan completed successfully. Progress: ${data.progress}%`)
          closeEventSource()
          onComplete()
        }
      } catch (err) {
        console.error("Error parsing SSE message:", err)
        setError("Failed to parse server message")
      }
    }

    // Handle connection open
    eventSource.onopen = () => {
      console.log("SSE connection opened")
    }

    // Handle errors
    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err)
      setError("Connection to scan service failed")
      closeEventSource()
    }
  }

  // Function to close the EventSource connection
  const closeEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsScanning(false)
  }

  // Handle component unmount
  useEffect(() => {
    return () => {
      closeEventSource()
    }
  }, [])

  // Handle cancel button click
  const handleCancel = () => {
    closeEventSource()
    setStatus("Scan cancelled")
    toast({
      title: "Scan Cancelled",
      description: "The media scan was cancelled",
      variant: "default",
    })
    if (onCancel) {
      onCancel()
    }
  }

  // Determine the color of the progress bar based on the current phase
  const getProgressColor = () => {
    if (progress < 35) return "bg-blue-600" // Scanning movie directories
    if (progress < 70) return "bg-purple-600" // Scanning series directories
    if (progress < 90) return "bg-amber-600" // Cleanup operations
    return "bg-green-600" // Final stages
  }

  // Render the details section based on current operation
  const renderDetails = () => {
    if (!details) return null

    return (
      <div className="mt-2 text-sm">
        {details.path && (
          <div className="mb-1">
            <span className="text-gray-400">Path: </span>
            <code className="bg-gray-800 px-1 py-0.5 rounded text-green-400 text-xs">{details.path}</code>
          </div>
        )}
        
        {details.title && (
          <div className="mb-1">
            <span className="text-gray-400">Processing: </span>
            <span className="text-white">{details.title}</span>
          </div>
        )}
        
        {details.current && details.total && (
          <div className="mb-1">
            <span className="text-gray-400">Progress: </span>
            <span className="text-white">{details.current} of {details.total}</span>
            <span className="text-gray-400 ml-1">
              ({Math.round((details.current / details.total) * 100)}%)
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
      <CardContent className="p-6">
        {!isScanning && !scanSummary && !error ? (
          <div className="text-center py-4">
            <h3 className="text-xl font-semibold text-white mb-4">Media Scanner</h3>
            <p className="text-gray-400 mb-6">
              Start a scan to discover and organize your media files
            </p>
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700"
              onClick={startScan}
            >
              Start Scan
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Media Scan</h3>
              {isScanning && (
                <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-500">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Scanning
                </Badge>
              )}
              {error && (
                <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
              )}
              {scanSummary && !error && (
                <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white">{status}</span>
                <span className="text-sm text-gray-400">{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-gray-800" 
                indicatorClassName={getProgressColor()}
              />
            </div>

            {renderDetails()}

            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-md text-red-400 text-sm">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {scanSummary && !error && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-md text-green-400 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>{scanSummary}</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              {isScanning ? (
                <Button 
                  variant="outline" 
                  className="border-red-600 text-red-400 hover:bg-red-600/10"
                  onClick={handleCancel}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel Scan
                </Button>
              ) : (
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={startScan}
                >
                  Scan Again
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
