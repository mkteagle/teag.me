"use client";
import React from "react";
import LoginButton from "@/components/auth/login-button";
import { Card } from "@/components/ui/card";
import { useDetectInAppBrowser } from "@/hooks/use-detect-in-app-browser";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

export function LoginPageClient() {
  const isInAppBrowser = useDetectInAppBrowser();
  const [isIOS, setIsIOS] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    userAgent: "",
    isIOS: false,
    isInAppBrowser: false,
    platform: "",
  });

  useEffect(() => {
    // Enhanced detection
    const userAgent = navigator.userAgent || navigator.vendor || "";
    const platform = navigator.platform || "";

    // More comprehensive iOS detection
    const isIOSDevice =
      /iPhone|iPad|iPod/.test(userAgent) ||
      (platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // Enhanced in-app browser detection
    const isInApp =
      /FBAN|FBAV|Instagram|LinkedIn|Twitter|Line|KAKAOTALK|NAVER|selenium|WhatsApp|Electron|Teams-Windows|Teams-Mac|DingTalk|Electron|MicroMessenger|QQ|IEMobile/i.test(
        userAgent
      );

    setIsIOS(isIOSDevice);
    setDebugInfo({
      userAgent,
      isIOS: isIOSDevice,
      isInAppBrowser: isInApp || isInAppBrowser,
      platform,
    });
  }, [isInAppBrowser]);

  const getBrowserSpecificText = () => {
    const ua = debugInfo.userAgent;
    if (/LinkedIn/i.test(ua)) {
      return "Open in Browser";
    } else if (/FBAN|FBAV/i.test(ua)) {
      return "Open in External Browser";
    }
    return "Open in Default Browser";
  };

  const handleBrowserAction = () => {
    if (isIOS) {
      // Show overlay for iOS users
      setShowOverlay(true);
    } else {
      // Direct action for Android users
      const url = window.location.href;
      const intentUrl = `intent://${url.replace(
        /^https?:\/\//,
        ""
      )}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
    }
  };

  // If in an in-app browser, show warning message
  if (debugInfo.isInAppBrowser) {
    return (
      <div className="fixed inset-0 w-full min-h-screen flex items-center justify-center p-4">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-blue-900 to-purple-900 opacity-50" />
        <div className="absolute inset-0 bg-[url('/bg.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        {/* iOS Overlay - only shown when button is clicked */}
        {showOverlay && isIOS && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
            {/* Arrow pointing to menu */}
            <div className="absolute top-0 right-8 mt-2 z-50">
              <ArrowUpRight
                className="w-12 h-12 text-white animate-bounce"
                style={{
                  transform: "rotate(-45deg)",
                  filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))",
                }}
              />
            </div>

            {/* Main content */}
            <div className="relative z-40 flex items-center justify-center min-h-screen p-4">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg max-w-md w-full p-6 shadow-2xl">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-white">
                      {getBrowserSpecificText()}
                    </h2>
                    <p className="text-gray-400">
                      To continue signing in, please follow these steps:
                    </p>
                  </div>

                  <ol className="space-y-4 text-sm text-white">
                    <li className="flex gap-3">
                      <span className="font-bold">1.</span>
                      <span>
                        Tap the <strong>⋯</strong> menu icon in the top right
                        corner
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">2.</span>
                      <span>
                        Select <strong>"{getBrowserSpecificText()}"</strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">3.</span>
                      <span>Complete the sign-in process in your browser</span>
                    </li>
                  </ol>

                  <div className="pt-4">
                    <Button
                      onClick={() => setShowOverlay(false)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    >
                      Got it
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main card with explanation and button */}
        <Card className="w-full max-w-md relative bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="p-6 md:p-8 space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Browser Not Supported
              </h1>
              <p className="text-gray-400">
                For security reasons, Google blocks sign-in attempts from in-app
                browsers like the one you're currently using. This helps protect
                your account from potential security risks.
              </p>
              <p className="text-gray-400 mt-4">
                Please open this page in your default browser to safely complete
                the sign-in process.
              </p>
            </div>

            <Button onClick={handleBrowserAction} className="w-full">
              {getBrowserSpecificText()}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Regular login view for non-in-app browsers
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
    </>
  );
}
