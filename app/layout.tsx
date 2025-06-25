import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { PWAInstallPrompt } from "@/components/ui/pwa-install-prompt";
import { ServiceWorkerRegistration } from "@/components/ui/service-worker-registration";
import { ApiUrlProviderWrapper } from "@/components/providers/api-url-provider-wrapper";
import { AuthProviderWrapper } from "@/components/providers/auth-provider-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Samflix",
  description:
    "A modern media library viewer, manager and streaming platform for movies and TV series",
  keywords: ["media", "movies", "tv series", "streaming", "library", "manager"],
  authors: [{ name: "Samflix Team" }],
  creator: "Dev-Sam",
  publisher: "Dev-Sam",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Samflix",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Samflix",
    "application-name": "Samflix",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#de1310" },
    { media: "(prefers-color-scheme: dark)", color: "#de1310" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProviderWrapper>
      <html lang="en" className="dark">
        <head>
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="background-color" content="#000000" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="apple-mobile-web-app-title" content="Samflix" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="application-name" content="Samflix" />
          <meta name="msapplication-TileColor" content="#000000" />
        </head>
        <body className={`${inter.className} bg-black text-white`}>
          <ApiUrlProviderWrapper>
            <ServiceWorkerRegistration />
            <Navbar />
            {children}
            <PWAInstallPrompt />
          </ApiUrlProviderWrapper>
        </body>
      </html>
    </AuthProviderWrapper>
  );
}
