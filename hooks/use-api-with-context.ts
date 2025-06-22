"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError } from "@/lib/api";
import { useApiUrl } from "@/contexts/api-url-context";

// For client components that need real-time data with dynamic API URL
export function useApiWithContext<T>(
  apiCallFactory: (baseUrl: string) => () => Promise<T>,
  dependencies: any[] = []
) {
  const { apiBaseUrl } = useApiUrl();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Store apiCallFactory in a ref to avoid it being included in dependency arrays
  const apiCallFactoryRef = useRef(apiCallFactory);
  apiCallFactoryRef.current = apiCallFactory;

  const fetchData = useCallback(async () => {
    if (!apiBaseUrl) {
      setError(new ApiError("API URL is not defined", 0));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const apiCall = apiCallFactoryRef.current(apiBaseUrl);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err : new ApiError("Unknown error", 0)
      );
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// For mutations with dynamic API URL
export function useMutationWithContext<T, P = any>(
  mutationFnFactory: (baseUrl: string) => (params: P) => Promise<T>
) {
  const { apiBaseUrl } = useApiUrl();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);

  // Store mutationFnFactory in a ref to avoid recreating functions
  const mutationFnFactoryRef = useRef(mutationFnFactory);
  mutationFnFactoryRef.current = mutationFnFactory;

  const mutate = async (params: P) => {
    if (!apiBaseUrl) {
      const error = new ApiError("API URL is not defined", 0);
      setError(error);
      throw error;
    }

    try {
      setLoading(true);
      setError(null);
      const mutationFn = mutationFnFactoryRef.current(apiBaseUrl);
      const result = await mutationFn(params);
      setData(result);
      return result;
    } catch (err) {
      const error =
        err instanceof ApiError ? err : new ApiError("Unknown error", 0);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
}
