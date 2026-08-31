"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";
import { posthogKey } from "@/lib/posthog";

export function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!posthogKey) return;
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false,
      person_profiles: "identified_only",
      persistence: "localStorage+cookie",
    });
    posthog.register({
      app: "teag.me",
      platform: "web",
      environment: process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV,
    });
  }, []);

  useEffect(() => {
    if (!posthogKey) return;
    posthog.capture("$pageview", { $current_url: pathname });
  }, [pathname]);

  useEffect(() => {
    if (!posthogKey) return;
    if (session?.user?.id) posthog.identify(session.user.id);
    else posthog.reset();
  }, [session?.user?.id]);

  return children;
}
