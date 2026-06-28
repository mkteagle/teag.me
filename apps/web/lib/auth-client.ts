"use client";

import { createAuthClient } from "better-auth/react";

// Use the current origin for auth requests. Better-auth resolves the base URL
// from window.location.origin in the browser (and BETTER_AUTH_URL during SSR),
// so sign-in works on localhost, preview deploys, and production alike.
//
// Do NOT hardcode this to NEXT_PUBLIC_BASE_URL: that pinned every client to a
// single origin, which broke sign-in cross-origin ("Failed to fetch") on
// localhost and on any deploy where the build-time value was missing/wrong.
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined" ? window.location.origin : undefined,
});

export async function logout() {
  await authClient.signOut();
  window.location.href = "/auth/login";
}
