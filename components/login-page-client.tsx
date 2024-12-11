"use client";
import React from "react";
import LoginButton from "@/components/login-button";
import { Card } from "@/components/ui/card";
import { useDetectInAppBrowser } from "@/hooks/use-detect-in-app-browser";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function LoginPageClient() {
  const isInAppBrowser = useDetectInAppBrowser();
  const [isIOS, setIsIOS] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = navigator.userAgent || navigator.vendor;
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));
  }, []);

  const openInDefaultBrowser = () => {
    const url = window.location.href;
    const userAgent = navigator.userAgent || navigator.vendor;

    if (/android/i.test(userAgent)) {
      // Android: Use intent:// to open the default browser
      const intentUrl = `intent://${url.replace(
        /^https?:\/\//,
        ""
      )}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
    } else if (isIOS) {
      // iOS: Open the dialog with instructions
      setIsDialogOpen(true);
    }
  };

  // If in an in-app browser, show warning message
  if (isInAppBrowser) {
    return (
      <div className="fixed inset-0 w-full min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-blue-900 to-purple-900 opacity-50" />
        <div className="absolute inset-0 bg-[url('/bg.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <Card className="w-full max-w-md relative bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="p-6 md:p-8 space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Browser Not Supported
              </h1>
              <p className="text-gray-400">
                Google blocks sign-in attempts from in-app browsers like
                Facebook, Instagram, or LinkedIn for security reasons. Please
                open this page in your default browser to continue.
              </p>
            </div>

            <Button onClick={openInDefaultBrowser} className="w-full">
              Open in Default Browser
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
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
                Sign in with your Google account to access your QR code
                dashboard
              </p>
            </div>

            <div className="space-y-4">
              <LoginButton />
              <p className="text-xs text-center text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* iOS Instructions Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="p-6 space-y-4 text-center">
            <h2 className="text-xl font-bold">Open in Safari</h2>
            <div className="space-y-2">
              <p>To continue signing in, please follow these steps:</p>
              <ol className="text-left space-y-2 text-sm">
                <li>
                  1. Tap the <strong>Share</strong> icon {"\u2197"} in the
                  bottom menu bar
                </li>
                <li>
                  2. Scroll down and tap <strong>"Open in Safari"</strong>
                </li>
                <li>3. Complete the sign-in process in Safari</li>
              </ol>
            </div>
            <Button onClick={() => setIsDialogOpen(false)} className="mt-4">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
