"use client";

import posthog from "posthog-js";

export const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function getPostHog() {
  if (!posthogKey || typeof window === "undefined") return null;
  return posthog;
}

export function capture(event: string, properties?: Record<string, string | number | boolean | null>) {
  getPostHog()?.capture(event, properties);
}
