"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    // Check if app is installed
    const checkInstalled = () => {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error during installation:", error);
    }
  };

  if (isInstalled && isOnline) {
    return null; // Don't show anything if installed and online
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col space-y-2">
        {/* Online/Offline Status */}
        {!isOnline && (
          <div className="bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">You&apos;re offline</span>
          </div>
        )}

        {/* Install Button */}
        {!isInstalled && deferredPrompt && (
          <Button
            onClick={handleInstall}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
        )}

        {/* Online Status (when back online) */}
        {isOnline && (
          <div className="bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">Back online</span>
          </div>
        )}
      </div>
    </div>
  );
}
