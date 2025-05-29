"use client"

import { useState, useEffect, useCallback } from "react"
import { ApiError } from "@/lib/api"

// Generic hook for API calls
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

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Hook for paginated data
export function usePaginatedApi<T>(
  apiCall: (params: any) => Promise<{ data: T[]; pagination: any }>,
  initialParams: any = {},
) {
  const [data, setData] = useState<T[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [params, setParams] = useState(initialParams)

  const fetchData = useCallback(
    async (newParams = params) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall(newParams)
        setData(result.data)
        setPagination(result.pagination)
      } catch (err) {
        setError(err instanceof ApiError ? err : new ApiError("Unknown error", 0))
      } finally {
        setLoading(false)
      }
    },
    [apiCall, params],
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateParams = useCallback(
    (newParams: any) => {
      setParams({ ...params, ...newParams })
      fetchData({ ...params, ...newParams })
    },
    [params, fetchData],
  )

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    pagination,
    loading,
    error,
    params,
    updateParams,
    refetch,
  }
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<T, P = any>(mutationFn: (params: P) => Promise<T>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      try {
        setLoading(true)
        setError(null)
        const result = await mutationFn(params)
        return result
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError("Unknown error", 0)
        setError(apiError)
        throw apiError
      } finally {
        setLoading(false)
      }
    },
    [mutationFn],
  )

  return { mutate, loading, error }
}
