"use client";

import { createAuthClient } from "better-auth/react";

const authBaseUrl = `${
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.BETTER_AUTH_URL ??
  "http://localhost:3000"
}/api/auth`;

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
});

export async function logout() {
  await authClient.signOut();
  window.location.href = "/auth/login";
}
