"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { networkDetector, NetworkConfig } from "@/lib/network-detector";

// Provide default fallback values if environment variables are undefined
const CLOUDFLARE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://samflix-be.devsam.in";
const LOCAL_API_URL =
  process.env.NEXT_PUBLIC_API_URL_LOCAL || "http://192.168.29.41:3310";

export type ApiUrlContextType = {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  networkConfig: NetworkConfig | null;
  isLocalNetwork: boolean;
  recheckNetwork: () => Promise<void>;
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
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig | null>(null);
  const [isLocalNetwork, setIsLocalNetwork] = useState<boolean>(false);

  const recheckNetwork = async () => {
    try {
      const config = await networkDetector.forceRecheck();
      setNetworkConfig(config);
      setIsLocalNetwork(config.isLocal);
      setApiBaseUrl(config.isLocal ? config.localUrl : config.tunnelUrl);
      console.log('Network rechecked:', config);
    } catch (error) {
      console.error('Network recheck failed:', error);
      setApiBaseUrl(CLOUDFLARE_API_URL);
    }
  };

  useEffect(() => {
    const initializeNetwork = async () => {
      try {
        const config = await networkDetector.detectNetwork();
        setNetworkConfig(config);
        setIsLocalNetwork(config.isLocal);
        setApiBaseUrl(config.isLocal ? config.localUrl : config.tunnelUrl);
        console.log('Network initialized:', config);
      } catch (error) {
        console.error('Network initialization failed:', error);
        setApiBaseUrl(CLOUDFLARE_API_URL);
      }
    };
    
    initializeNetwork();
  }, []);

  return (
    <ApiUrlContext.Provider 
      value={{ 
        apiBaseUrl, 
        setApiBaseUrl, 
        networkConfig, 
        isLocalNetwork, 
        recheckNetwork 
      }}
    >
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
