"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertTriangle, ExternalLink } from "lucide-react";
import LoginButton from "@/components/auth/login-button";
import { useDetectInAppBrowser } from "@/hooks/use-detect-in-app-browser";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Provider = "google" | "github" | "apple";

export function LoginPageClient({
  providers,
}: {
  providers: Provider[];
}) {
  const router = useRouter();
  const isInAppBrowser = useDetectInAppBrowser();
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [isPending, router, session]);

  const handleOpenBrowser = () => {
    window.location.href = window.location.href;
  };

  if (isInAppBrowser) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-black/10 bg-[hsl(var(--card))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-red-50 p-4 text-red-600">
              <AlertTriangle className="h-10 w-10" />
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              Open In Your Browser
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Social sign-in is blocked inside many in-app browsers. Open this
              page in Safari or Chrome to continue.
            </p>
          </div>

          <Button className="mt-8 w-full" onClick={handleOpenBrowser}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open In Browser
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex min-h-screen items-center justify-center p-4"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,123,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,138,61,0.10),transparent_32%)]" />

      <div className="relative w-full max-w-md rounded-[28px] border border-black/10 bg-[hsl(var(--card))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:p-10">
        <div className="mb-8 flex justify-center">
          <div className="rounded-3xl bg-primary/10 p-5 text-primary">
            <Activity className="h-10 w-10" strokeWidth={2.25} />
          </div>
        </div>

        <div className="space-y-3 text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            Sign in to teag.me
          </h1>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
            Free QR Tracking
          </p>
          <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
            Create dynamic QR codes, track scans, and manage your links without
            the usual paywall games.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-black/8 bg-white/60 p-5">
          <LoginButton providers={providers} />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
