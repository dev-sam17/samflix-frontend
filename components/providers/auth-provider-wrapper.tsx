"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/contexts/auth-context";

export function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <AuthProvider>{children}</AuthProvider>
    </ClerkProvider>
  );
}
