"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// Provide default fallback values if environment variables are undefined
const CLOUDFLARE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.samflix.dev";
const LOCAL_API_URL =
  process.env.NEXT_PUBLIC_API_URL_LOCAL || "http://localhost:3000";

export type ApiUrlContextType = {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
};

const ApiUrlContext = createContext<ApiUrlContextType | undefined>(undefined);

interface ApiUrlProviderProps {
  children: ReactNode;
  initialApiUrl?: string;
}

export function ApiUrlProvider({
  children,
  initialApiUrl = CLOUDFLARE_API_URL,
}: ApiUrlProviderProps) {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    initialApiUrl || CLOUDFLARE_API_URL
  );

  useEffect(() => {
    const checkConnection = async () => {
      // Skip local API check in production or when running on HTTPS
      const isProduction = process.env.NODE_ENV === 'production';
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      
      if (isProduction || isHttps) {
        // In production or HTTPS, use the cloud API directly
        setApiBaseUrl(CLOUDFLARE_API_URL);
        return;
      }
      
      try {
        if (LOCAL_API_URL && !LOCAL_API_URL.includes('localhost') && !LOCAL_API_URL.includes('127.0.0.1')) {
          // Only try local API if it's not localhost (to avoid mixed content)
          const response = await fetch(`${LOCAL_API_URL}/health`, {
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });
          if (response.ok) {
            setApiBaseUrl(LOCAL_API_URL);
            return;
          }
        }
      } catch (error) {
        console.warn('Local API not available, using cloud API:', error);
      }
      
      // Fallback to cloud API
      setApiBaseUrl(CLOUDFLARE_API_URL);
    };
    
    checkConnection();
  }, []);

  return (
    <ApiUrlContext.Provider value={{ apiBaseUrl, setApiBaseUrl }}>
      {children}
    </ApiUrlContext.Provider>
  );
}

export function useApiUrl() {
  const context = useContext(ApiUrlContext);
  if (context === undefined) {
    throw new Error("useApiUrl must be used within an ApiUrlProvider");
  }
  return context;
}
