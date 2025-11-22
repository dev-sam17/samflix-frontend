"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent as BaseDialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

// Custom DialogContent without the default close button
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Store the event globally to ensure we don't miss it
let deferredPromptEvent: BeforeInstallPromptEvent | null = null;

// Listen for the beforeinstallprompt event outside the component
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    console.log("beforeinstallprompt event was fired and saved globally");
    deferredPromptEvent = e as BeforeInstallPromptEvent;
  });
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      ) {
        console.log("App is already installed");
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkInstalled()) return;

    // If we already captured the event globally, use it
    if (deferredPromptEvent) {
      console.log("Using globally captured beforeinstallprompt event");
      setDeferredPrompt(deferredPromptEvent);

      // Show custom prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem("pwa-install-dismissed")) {
          setShowPrompt(true);
        }
      }, 3000);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log("beforeinstallprompt event captured in component");
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show custom prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem("pwa-install-dismissed")) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("App was installed");
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      deferredPromptEvent = null; // Clear the global reference too
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("No deferred prompt available for installation");
      return;
    }

    try {
      console.log("Prompting for installation");
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User choice outcome: ${outcome}`);

      if (outcome === "accepted") {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      deferredPromptEvent = null; // Clear the global reference too
      setShowPrompt(false);
    } catch (error) {
      console.error("Error during installation:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed the prompt
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleNotNow = () => {
    setShowPrompt(false);
    // Don't set permanent dismissal, allow showing again later
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        /* Hide only the default close button in the dialog */
        .pwa-dialog .absolute.right-4.top-4 {
          display: none;
        }
      `}</style>
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="pwa-dialog sm:max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src="/logo.png"
                  alt="Samflix Logo"
                  width={48}
                  height={48}
                  className="rounded"
                />
                <div>
                  <DialogTitle className="text-white text-lg">
                    Install Samflix
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Get the full app experience
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">
                Why install Samflix?
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-red-500" />
                  <span>Loads faster and smoother</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4 text-red-500" />
                  <span>Full-screen experience without browser UI</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Download className="h-4 w-4 text-red-500" />
                  <span>Quick access from your home screen</span>
                </li>
              </ul>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
              <Button
                variant="outline"
                onClick={handleNotNow}
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Not Now
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              You can always install later from your browser menu
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
