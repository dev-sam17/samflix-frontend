"use client";

import React from "react";
import { useApiWithContext } from "@/hooks/use-api-with-context";
import { useMutationWithContext } from "@/hooks/use-api-with-context";
import { useApiUrl } from "@/contexts/api-url-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ApiUrlConfig } from "@/components/api-url-config";

// Example component that uses the API URL context
export function ApiContextExample() {
  const { apiBaseUrl } = useApiUrl();

  // Example of using the useApiWithContext hook
  const {
    data: healthData,
    loading: healthLoading,
    error: healthError,
    refetch,
  } = useApiWithContext(
    (baseUrl) => () => fetch(`${baseUrl}/health`).then((res) => res.json()),
    []
  );

  // Example of using the useMutationWithContext hook
  const {
    mutate,
    loading: mutationLoading,
    error: mutationError,
  } = useMutationWithContext((baseUrl) => async (message: string) => {
    // This is just a demonstration - replace with your actual API endpoint
    const response = await fetch(`${baseUrl}/api/example`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    return response.json();
  });

  const handleMutation = async () => {
    try {
      await mutate("Hello from API context example");
      alert("Mutation successful!");
    } catch (error) {
      console.error("Mutation failed:", error);
    }
  };

  return (
    <div className="space-y-8 p-4">
      <ApiUrlConfig />

      <Card>
        <CardHeader>
          <CardTitle>API Context Example</CardTitle>
          <CardDescription>
            This component demonstrates using the API URL context with custom
            hooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Current API URL</h3>
            <code className="bg-muted px-2 py-1 rounded text-sm block mt-2">
              {apiBaseUrl}
            </code>
          </div>

          <div>
            <h3 className="text-lg font-medium">Health Check</h3>
            {healthLoading ? (
              <p>Loading health data...</p>
            ) : healthError ? (
              <div>
                <p className="text-red-500">Error: {healthError.message}</p>
                <Button onClick={refetch} size="sm" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : (
              <pre className="bg-muted p-2 rounded text-sm mt-2 overflow-auto">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium">Test Mutation</h3>
            <Button
              onClick={handleMutation}
              disabled={mutationLoading}
              className="mt-2"
            >
              {mutationLoading ? "Sending..." : "Send Test Request"}
            </Button>
            {mutationError && (
              <p className="text-red-500 mt-2">
                Error: {mutationError.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
