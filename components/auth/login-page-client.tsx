"use client";
import React from "react";
import LoginButton from "@/components/auth/login-button";
import { useDetectInAppBrowser } from "@/hooks/use-detect-in-app-browser";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ArrowUpRight, Activity, AlertTriangle, ExternalLink } from "lucide-react";

export function LoginPageClient() {
  const isInAppBrowser = useDetectInAppBrowser();
  const [isIOS, setIsIOS] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    userAgent: "",
    isIOS: false,
    isInAppBrowser: false,
    platform: "",
  });

  useEffect(() => {
    setMounted(true);
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
      <div className="fixed inset-0 w-full min-h-screen flex items-center justify-center p-4 pixel-grid">
        {/* iOS Overlay - only shown when button is clicked */}
        {showOverlay && isIOS && (
          <div className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-sm">
            {/* Arrow pointing to menu */}
            <div className="absolute top-0 right-8 mt-2 z-50">
              <ArrowUpRight
                className="w-12 h-12 text-primary animate-bounce"
                style={{
                  transform: "rotate(-45deg)",
                  filter: "drop-shadow(0 0 8px hsl(var(--primary)))",
                }}
                strokeWidth={2.5}
              />
            </div>

            {/* Main content */}
            <div className="relative z-40 flex items-center justify-center min-h-screen p-4">
              <div className="data-card bg-card max-w-md w-full p-8">
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold">
                      {getBrowserSpecificText()}
                    </h2>
                    <p className="font-serif text-muted-foreground">
                      To continue signing in, please follow these steps:
                    </p>
                  </div>

                  <ol className="space-y-4 text-sm font-serif">
                    <li className="flex gap-3 p-3 bg-muted/50 border-l-4 border-primary">
                      <span className="font-mono font-bold text-primary">1.</span>
                      <span>
                        Tap the <strong className="font-mono">⋯</strong> menu icon in the top right
                        corner
                      </span>
                    </li>
                    <li className="flex gap-3 p-3 bg-muted/50 border-l-4 border-primary">
                      <span className="font-mono font-bold text-primary">2.</span>
                      <span>
                        Select <strong className="font-mono">"{getBrowserSpecificText()}"</strong>
                      </span>
                    </li>
                    <li className="flex gap-3 p-3 bg-muted/50 border-l-4 border-primary">
                      <span className="font-mono font-bold text-primary">3.</span>
                      <span>Complete the sign-in process in your browser</span>
                    </li>
                  </ol>

                  <div className="pt-4">
                    <Button
                      onClick={() => setShowOverlay(false)}
                      className="w-full font-mono font-semibold border-2 border-foreground bg-card hover:bg-foreground hover:text-background"
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
        <div className="w-full max-w-md relative data-card p-8">
          <div className="space-y-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl" />
                <div className="relative data-card bg-destructive/10 border-destructive p-4">
                  <AlertTriangle className="w-12 h-12 text-destructive" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Browser Not Supported
              </h1>
              <div className="receipt-line" />
              <p className="font-serif text-muted-foreground leading-relaxed">
                For security reasons, Google blocks sign-in attempts from in-app
                browsers like the one you're currently using. This helps protect
                your account from potential security risks.
              </p>
              <p className="font-serif text-muted-foreground leading-relaxed">
                Please open this page in your default browser to safely complete
                the sign-in process.
              </p>
            </div>

            <Button
              onClick={handleBrowserAction}
              className="w-full data-card border-2 border-foreground bg-foreground text-background hover:bg-primary hover:border-primary font-mono font-semibold"
              size="lg"
            >
              <ExternalLink className="mr-2 h-5 w-5" strokeWidth={2.5} />
              {getBrowserSpecificText()}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Regular login view for non-in-app browsers
  return (
    <div
      className="fixed inset-0 w-full min-h-screen flex items-center justify-center p-4"
      style={{
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pixel-grid opacity-30" />

      {/* Accent shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 border-4 border-primary/20 rotate-12" />
      <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-primary/20 -rotate-12" />

      <div className="w-full max-w-md relative">
        <div
          className="data-card p-8 md:p-12"
          style={{
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            opacity: mounted ? 1 : 0,
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
          }}
        >
          <div className="space-y-8">
            {/* Logo/Icon */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl" />
                <div className="relative data-card bg-primary/10 border-primary p-6">
                  <Activity className="w-12 h-12 text-primary" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-3 text-center">
              <h1 className="text-4xl font-bold tracking-tight">
                teag.me
              </h1>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                QR Analytics Platform
              </p>
              <div className="receipt-line" />
              <p className="font-serif text-muted-foreground leading-relaxed">
                Sign in with your Google account to access your QR code
                dashboard and analytics
              </p>
            </div>

            {/* Login Section */}
            <div className="space-y-6">
              <div className="p-6 bg-primary/5 border-2 border-dashed border-primary/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-sm font-mono uppercase tracking-wider text-primary">
                      Authentication Required
                    </span>
                  </div>
                  <LoginButton />
                </div>
              </div>

              <p className="text-xs text-center font-serif text-muted-foreground">
                By signing in, you agree to our{" "}
                <a href="/terms" className="text-primary hover:underline font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Version badge */}
        <div className="mt-6 flex justify-center">
          <div className="mono-badge">
            VERSION 2.0.1 • SECURE AUTH
          </div>
        </div>
      </div>
    </div>
  );
}
