"use client"

import { useState, useEffect, useCallback, use } from "react"
import { ApiError } from "@/lib/api"

// For client components that need real-time data
export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("Unknown error", 0))
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// For server components or client components that can use Suspense
export function useSuspenseApi<T>(promise: Promise<T>) {
  return use(promise)
}

// Hook for handling mutations (create, update, delete operations)
export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [data, setData] = useState<T | null>(null)

  const mutate = async (params: P) => {
    try {
      setLoading(true)
      setError(null)
      const result = await mutationFn(params)
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof ApiError ? err : new ApiError("Unknown error", 0)
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error, data }
}
