"use client";

import LoginButton from "@/components/login-button";
import { Card } from "@/components/ui/card";
import { useDetectInAppBrowser } from "@/hooks/use-detect-in-app-browser";
import { Dialog } from "@/components/ui/dialog"; // Import Dialog component
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export default function LoginPageClient() {
  const isInAppBrowser = useDetectInAppBrowser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isInAppBrowser) {
      setIsDialogOpen(true); // Automatically open the dialog if in an in-app browser
    }
  }, [isInAppBrowser]);

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const openInDefaultBrowser = () => {
    const url = window.location.href;
    const userAgent = navigator.userAgent || navigator.vendor;

    if (/android/i.test(userAgent)) {
      const intentUrl = `intent://${url.replace(
        /^https?:\/\//,
        ""
      )}#Intent;scheme=https;end`;
      window.location.href = intentUrl; // Android intent
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      setIsDialogOpen(true); // Show instructions dialog for iOS
    }
  };

  if (isInAppBrowser) {
    return (
      <>
        <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
          <div className="p-6 space-y-4 text-center">
            <h1 className="text-xl font-bold text-gray-800">
              Open in Default Browser
            </h1>
            <p className="text-gray-600">
              For a better experience, please open this page in your default
              browser.
            </p>
            <p className="text-gray-600">
              <strong>iOS:</strong> Tap the <strong>share</strong> icon (a box
              with an arrow pointing up) in the bottom navigation bar, then
              select <strong>"Open in Safari"</strong>.
            </p>
            <p className="text-gray-600">
              <strong>Android:</strong> Tap the <strong>menu</strong> icon
              (three dots in the top-right corner) and select{" "}
              <strong>"Open in Browser"</strong>.
            </p>
            <Button
              onClick={closeDialog}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Got it!
            </Button>
          </div>
        </Dialog>

        <div className="fixed inset-0 w-full min-h-screen flex items-center justify-center p-4 bg-black text-white">
          <h1 className="text-2xl font-bold mb-4">Open in Default Browser</h1>
          <Button
            onClick={openInDefaultBrowser}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Open in Default Browser
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-0 w-full min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-blue-900 to-purple-900 opacity-50" />
      <div className="absolute inset-0 bg-[url('/bg.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <Card className="w-full max-w-md relative bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="p-6 md:p-8 space-y-8">
          <div className="space-y-2 text-center">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-xl opacity-50" />
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-500 w-full h-full rounded-xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-gray-400">
              Sign in with your Google account to access your QR code dashboard
            </p>
          </div>

          <div className="space-y-4">
            <LoginButton />
            <p className="text-xs text-center text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
