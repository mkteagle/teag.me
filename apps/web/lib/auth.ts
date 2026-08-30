import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "@better-auth/passkey";
import { expo } from "@better-auth/expo";
import { getDb } from "@/lib/db";
import {
  accounts,
  passkeys,
  qrCodes,
  scans,
  sessions,
  users,
  verifications,
} from "@/lib/db/schema";

function getBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    "http://localhost:3000"
  );
}

function getSecret() {
  return (
    process.env.BETTER_AUTH_SECRET ??
    process.env.AUTH_SECRET ??
    "dev-only-better-auth-secret-change-me"
  );
}

function getSocialProviders() {
  const providers: Record<string, Record<string, string>> = {};

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account",
    };
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.github = {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
  }

  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    providers.apple = {
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    };
  }

  return providers;
}

export const auth = betterAuth({
  baseURL: getBaseUrl(),
  secret: getSecret(),
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
      passkey: passkeys,
      qrCodes,
      scans,
    },
  }),
  trustedOrigins: [
    "teagme-scanner://",
    "teagme-scanner://*",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://*", "exp://**", "http://localhost:*", "http://127.0.0.1:*"]
      : []),
  ],
  plugins: [
    expo(),
    passkey({
      rpID: new URL(getBaseUrl()).hostname, // "teag.me" in prod, "localhost" in dev
      rpName: "teag.me",
      origin: getBaseUrl(), // full origin the passkey is bound to
    }),
    // nextCookies() must stay last.
    nextCookies(),
  ],
  trustedProviders: ["google", "apple", "github"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  socialProviders: getSocialProviders(),
});
