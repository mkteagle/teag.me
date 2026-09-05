import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "@better-auth/passkey";
import { expo } from "@better-auth/expo";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { deleteFromR2 } from "@/lib/r2-storage";
import {
  getAppleClientSecret,
  isAppleAuthConfigured,
} from "@/lib/apple-client-secret";
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
  const providers: Record<string, unknown> = {};

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

  if (isAppleAuthConfigured()) {
    providers.apple = async () => ({
      clientId: process.env.APPLE_CLIENT_ID!.trim(),
      clientSecret: await getAppleClientSecret(),
      audience: [
        process.env.APPLE_CLIENT_ID?.trim(),
        process.env.APPLE_BUNDLE_ID?.trim() ?? "me.teag.scanner",
      ].filter(Boolean) as string[],
    });
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
    "https://appleid.apple.com",
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
      beforeDelete: async (user) => {
        const ownedCodes = await getDb()
          .select({ id: qrCodes.id, logoUrl: qrCodes.logoUrl })
          .from(qrCodes)
          .where(eq(qrCodes.userId, user.id));

        await deleteFromR2(
          ownedCodes.flatMap((code) => [
            `qr-codes/${code.id}.jpg`,
            ...(code.logoUrl ? [`logos/${code.id}-logo.png`] : []),
          ])
        );
      },
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
