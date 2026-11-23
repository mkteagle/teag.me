"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";
import { posthogKey } from "@/lib/posthog";

const publicAndWorkspacePaths = new Set([
  "/", "/scanner", "/scanner/privacy", "/scanner/terms", "/scanner/delete-account",
  "/privacy", "/terms", "/auth/login", "/dashboard", "/generate", "/history",
  "/settings", "/upgrade", "/docs", "/link-pages", "/admin/dashboard", "/not-found",
]);

function analyticsPath(pathname: string) {
  if (publicAndWorkspacePaths.has(pathname)) return pathname;
  if (pathname.startsWith("/link-pages/")) return "/link-pages/[id]";
  if (pathname.startsWith("/analytics/")) return "/analytics/[id]";
  return "/other";
}

const appProperties = {
  app: "teag.me",
  platform: "web",
  environment: process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV,
};

export function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const lastPageview = useRef<string | null>(null);

  useEffect(() => {
    if (!posthogKey) return;
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: false,
      autocapture: false,
      capture_dead_clicks: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      save_referrer: false,
      save_campaign_params: false,
      person_profiles: "identified_only",
      persistence: "localStorage+cookie",
      before_send: (event) => {
        if (!event) return null;
        const properties: typeof event.properties = { ...event.properties, ...appProperties };
        // The SDK adds URL and referrer metadata to custom and identity events too.
        for (const key of Object.keys(properties)) {
          if (/(url|path|referr|title|utm_|clid)/i.test(key) && key !== "custom_path") {
            delete properties[key];
          }
        }
        delete properties.$set;
        delete properties.$set_once;
        const path = analyticsPath(window.location.pathname);
        properties.$current_url = window.location.origin + path;
        properties.$pathname = path;
        properties.$geoip_disable = true;
        return { ...event, properties, $set: undefined, $set_once: undefined };
      },
    });

    const trackMarketingClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const action = event.target.closest("[data-marketing-cta]")
        ?.getAttribute("data-marketing-cta");
      if (action) posthog.capture("marketing_cta_clicked", { action });
    };
    document.addEventListener("click", trackMarketingClick, { capture: true });
    return () => document.removeEventListener("click", trackMarketingClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!posthogKey || isPending) return;
    const userId = session?.user?.id;
    const identifiedUser = posthog.get_property("$user_id");
    if (identifiedUser && identifiedUser !== userId) posthog.reset();
    if (userId && userId !== identifiedUser) posthog.identify(userId);
  }, [isPending, session?.user?.id]);

  useEffect(() => {
    if (!posthogKey || isPending || !pathname || lastPageview.current === pathname) return;
    lastPageview.current = pathname;
    posthog.capture("$pageview");
  }, [isPending, pathname]);

  return children;
}
