"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// Use only the tunnel URL for simplicity
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://samflix-be.devsam.in";

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
  initialApiUrl = API_URL,
}: ApiUrlProviderProps) {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    initialApiUrl || API_URL
  );

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
