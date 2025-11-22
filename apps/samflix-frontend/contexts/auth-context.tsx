"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null | undefined;
  user: any | null;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: isClerkLoaded, userId } = useClerkAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Consider auth ready when both clerk auth and user data are loaded
    if (isClerkLoaded && isUserLoaded) {
      setIsLoading(false);
    }
  }, [isClerkLoaded, isUserLoaded]);

  // Check if user has admin role in public metadata
  const isAdmin = user?.publicMetadata?.role === "admin";

  const value = {
    isAuthenticated: !!userId,
    isLoading,
    userId: userId || null,
    user,
    isAdmin,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
