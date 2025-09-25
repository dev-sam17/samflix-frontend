import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storage Manager | Samflix Admin",
  description: "Monitor disk usage, manage storage locations, and optimize media file organization across drives.",
};

export default function StorageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
