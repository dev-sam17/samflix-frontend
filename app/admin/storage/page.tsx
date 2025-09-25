"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  HardDrive,
  RefreshCw,
  Database,
  Film,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "@/lib/api";

interface StorageStats {
  totalSpaceOccupied: string;
  spaceOccupiedByRawMedia: string;
  spaceOccupiedByHlsMedia: string;
  totalDiskSpace: string;
  lastScanTime: string | null;
  cached: boolean;
}

interface ScanStatus {
  lastScanTime: string | null;
  isScanning: boolean;
}

const COLORS = {
  raw: "#ef4444",
  hls: "#3b82f6",
  free: "#10b981",
  used: "#f59e0b",
};

// Helper function to convert size strings to bytes for calculations
const parseSize = (sizeStr: string): number => {
  const units: { [key: string]: number } = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5,
  };

  const match = sizeStr.match(/^([\d.]+)\s*([A-Z]+)$/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  return value * (units[unit] || 0);
};

// Helper function to format bytes to human readable
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function StoragePage() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newDiskSpace, setNewDiskSpace] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch storage stats
  const fetchStats = async () => {
    try {
      const data = await api.storage.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    }
  };

  // Fetch scan status
  const fetchScanStatus = async () => {
    try {
      const data = await api.storage.getScanStatus();
      setScanStatus(data);
    } catch (err) {
      console.error("Failed to fetch scan status:", err);
    }
  };

  // Force disk scan
  const forceScan = async () => {
    setScanning(true);
    try {
      await api.storage.forceScan();
      
      // Poll for scan completion
      const pollScanStatus = setInterval(async () => {
        await fetchScanStatus();
        if (scanStatus && !scanStatus.isScanning) {
          clearInterval(pollScanStatus);
          await fetchStats();
          setScanning(false);
        }
      }, 2000);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollScanStatus);
        setScanning(false);
      }, 300000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate scan");
      setScanning(false);
    }
  };

  // Update disk space
  const updateDiskSpace = async () => {
    if (!newDiskSpace.trim()) return;
    
    setUpdating(true);
    try {
      await api.storage.updateDiskSpace(newDiskSpace);
      await fetchStats();
      setNewDiskSpace("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update disk space");
    } finally {
      setUpdating(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchScanStatus()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scanning && !updating) {
        fetchStats();
        fetchScanStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [scanning, updating]);

  // Prepare chart data
  const getChartData = () => {
    if (!stats) return { pieData: [], barData: [] };

    const totalBytes = parseSize(stats.totalDiskSpace);
    const usedBytes = parseSize(stats.totalSpaceOccupied);
    const rawBytes = parseSize(stats.spaceOccupiedByRawMedia);
    const hlsBytes = parseSize(stats.spaceOccupiedByHlsMedia);
    const freeBytes = totalBytes - usedBytes;

    const pieData = [
      { name: "Raw Media", value: rawBytes, color: COLORS.raw },
      { name: "HLS Media", value: hlsBytes, color: COLORS.hls },
      { name: "Free Space", value: freeBytes, color: COLORS.free },
    ];

    const barData = [
      { name: "Raw Media", size: rawBytes, formatted: stats.spaceOccupiedByRawMedia },
      { name: "HLS Media", size: hlsBytes, formatted: stats.spaceOccupiedByHlsMedia },
      { name: "Free Space", size: freeBytes, formatted: formatBytes(freeBytes) },
    ];

    return { pieData, barData };
  };

  const { pieData, barData } = getChartData();
  const usagePercentage = stats ? (parseSize(stats.totalSpaceOccupied) / parseSize(stats.totalDiskSpace)) * 100 : 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <span className="ml-2 text-lg">Loading storage data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-8 h-8 text-red-500" />
            Storage Manager
          </h1>
          <p className="text-gray-400 mt-1">
            Monitor disk usage and manage storage across your media library
          </p>
        </div>
        <Badge variant="outline" className="border-green-500 text-green-400">
          Beta
        </Badge>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-500 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Used</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalSpaceOccupied || "0 B"}
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Raw Media</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.spaceOccupiedByRawMedia || "0 B"}
                </p>
              </div>
              <Film className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">HLS Media</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.spaceOccupiedByHlsMedia || "0 B"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Usage</p>
                <p className="text-2xl font-bold text-white">
                  {usagePercentage.toFixed(1)}%
                </p>
              </div>
              <PieChart className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Storage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatBytes(value as number)} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Storage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={formatBytes} />
                <Tooltip formatter={(value) => formatBytes(value as number)} />
                <Bar dataKey="size" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Controls */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Disk Scanning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Last Scan</p>
                <p className="text-white">
                  {stats?.lastScanTime 
                    ? new Date(stats.lastScanTime).toLocaleString()
                    : "Never"
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                {stats?.cached && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                    Cached
                  </Badge>
                )}
                {scanStatus?.isScanning || scanning ? (
                  <Badge className="bg-blue-600 text-white">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Scanning
                  </Badge>
                ) : (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              onClick={forceScan}
              disabled={scanning || scanStatus?.isScanning}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {scanning || scanStatus?.isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Force Disk Scan
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-400">
              Automatic scans run daily at midnight. Force scan to get immediate results.
            </p>
          </CardContent>
        </Card>

        {/* Disk Space Configuration */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Disk Space Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="diskSpace" className="text-gray-300">
                Total Disk Space
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="diskSpace"
                  value={newDiskSpace}
                  onChange={(e) => setNewDiskSpace(e.target.value)}
                  placeholder={stats?.totalDiskSpace || "e.g., 4TB"}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button
                  onClick={updateDiskSpace}
                  disabled={updating || !newDiskSpace.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              <p className="mb-2">Current: <span className="text-white">{stats?.totalDiskSpace}</span></p>
              <p>Valid formats: 4TB, 500GB, 1.5TB, 2048MB</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Cache Status</p>
              <p className="text-white">{stats?.cached ? "Active (1 hour TTL)" : "Fresh Data"}</p>
            </div>
            <div>
              <p className="text-gray-400">Scan Schedule</p>
              <p className="text-white">Daily at 00:00 UTC</p>
            </div>
            <div>
              <p className="text-gray-400">Data Source</p>
              <p className="text-white">File System + Redis Cache</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
