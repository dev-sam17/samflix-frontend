"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiUrl } from "@/contexts/api-url-context";
import { Wifi, WifiOff, RefreshCw, Globe, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function NetworkStatus() {
  const { apiBaseUrl, networkConfig, isLocalNetwork, recheckNetwork } = useApiUrl();
  const [isRechecking, setIsRechecking] = React.useState(false);

  const handleRecheck = async () => {
    setIsRechecking(true);
    try {
      await recheckNetwork();
    } finally {
      setIsRechecking(false);
    }
  };

  if (!networkConfig) {
    return null;
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isLocalNetwork ? "bg-green-500" : "bg-blue-500"
          )} />
          Network Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Connection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLocalNetwork ? (
              <Home className="w-4 h-4 text-green-400" />
            ) : (
              <Globe className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm text-gray-300">
              {isLocalNetwork ? "Local Network" : "Tunnel"}
            </span>
          </div>
          <Badge 
            variant={isLocalNetwork ? "default" : "secondary"}
            className={cn(
              "text-xs",
              isLocalNetwork 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isLocalNetwork ? "Local" : "Remote"}
          </Badge>
        </div>

        {/* API URL */}
        <div className="text-xs text-gray-400 font-mono bg-gray-800/50 p-2 rounded">
          {apiBaseUrl}
        </div>

        {/* Network Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="text-gray-400">Local:</div>
            <div className={cn(
              "flex items-center gap-1",
              networkConfig.isLocal ? "text-green-400" : "text-gray-500"
            )}>
              {networkConfig.isLocal ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span className="font-mono text-xs truncate">
                {networkConfig.localUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-400">Tunnel:</div>
            <div className="flex items-center gap-1 text-blue-400">
              <Globe className="w-3 h-3" />
              <span className="font-mono text-xs truncate">
                {networkConfig.tunnelUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>
          </div>
        </div>

        {/* Recheck Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecheck}
          disabled={isRechecking}
          className="w-full text-xs border-gray-700 hover:bg-gray-800"
        >
          {isRechecking ? (
            <>
              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 mr-2" />
              Recheck Network
            </>
          )}
        </Button>

        {/* HTTPS Warning */}
        {typeof window !== 'undefined' && 
         window.location.protocol === 'https:' && 
         networkConfig.localUrl.startsWith('http:') && (
          <div className="text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded border border-yellow-400/20">
            ⚠️ HTTPS site cannot access HTTP local server due to mixed content policy
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function NetworkStatusBadge() {
  const { isLocalNetwork } = useApiUrl();

  return (
    <Badge 
      variant={isLocalNetwork ? "default" : "secondary"}
      className={cn(
        "text-xs",
        isLocalNetwork 
          ? "bg-green-600 hover:bg-green-700" 
          : "bg-blue-600 hover:bg-blue-700"
      )}
    >
      {isLocalNetwork ? "Local" : "Tunnel"}
    </Badge>
  );
}
