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

type ApiUrlContextType = {
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
      try {
        if (LOCAL_API_URL) {
          const response = await fetch(`${LOCAL_API_URL}/health`);
          if (response.ok) {
            setApiBaseUrl(LOCAL_API_URL);
          }
        }
      } catch (error) {
        if (CLOUDFLARE_API_URL) {
          setApiBaseUrl(CLOUDFLARE_API_URL);
        }
      }
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
