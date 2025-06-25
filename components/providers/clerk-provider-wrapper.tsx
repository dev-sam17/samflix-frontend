"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

export function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
