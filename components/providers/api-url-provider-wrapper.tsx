"use client";

import React from "react";
import { ApiUrlProvider } from "@/contexts/api-url-context";

export function ApiUrlProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApiUrlProvider>{children}</ApiUrlProvider>;
}
