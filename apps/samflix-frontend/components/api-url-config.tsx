"use client";

import React, { useState } from "react";
import { useApiUrl } from "@/contexts/api-url-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ApiUrlConfig() {
  const { apiBaseUrl, setApiBaseUrl } = useApiUrl();
  const [inputUrl, setInputUrl] = useState(apiBaseUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(inputUrl);
  };

  const resetToDefault = () => {
    // Reset to the environment variable values
    const cloudflareUrl = process.env.NEXT_PUBLIC_API_URL_CLOUDFLARE as string;
    setInputUrl(cloudflareUrl);
    setApiBaseUrl(cloudflareUrl);
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiBaseUrl" className="text-sm font-medium">
              API Base URL
            </label>
            <div className="flex gap-2">
              <Input
                id="apiBaseUrl"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter API base URL"
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                Save
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Current API URL: </span>
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                {apiBaseUrl}
              </code>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetToDefault}
            >
              Reset to Default
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
