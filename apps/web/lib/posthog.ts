"use client";

import posthog from "posthog-js";

// PostHog project tokens are write-only public client keys. The environment
// override makes rotation possible without a code release.
export const posthogKey =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  "phc_zNZ3tkdhh2x5rihfRz3v9C5TaTipKddzqRYucKbe5wgg";

export function getPostHog() {
  if (!posthogKey || typeof window === "undefined") return null;
  return posthog;
}

export function capture(event: string, properties?: Record<string, string | number | boolean | null>) {
  getPostHog()?.capture(event, properties);
}
