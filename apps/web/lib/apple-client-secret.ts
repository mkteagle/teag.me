import { SignJWT, importPKCS8 } from "jose";

function normalizePrivateKey(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
    .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----")
    .trim();
}

export function isAppleAuthConfigured() {
  const hasStaticSecret = Boolean(process.env.APPLE_CLIENT_SECRET);
  const canGenerateSecret = Boolean(
    process.env.APPLE_TEAM_ID &&
      process.env.APPLE_KEY_ID &&
      process.env.APPLE_PRIVATE_KEY
  );

  return Boolean(process.env.APPLE_CLIENT_ID && (hasStaticSecret || canGenerateSecret));
}

export async function getAppleClientSecret() {
  if (process.env.APPLE_CLIENT_SECRET) {
    return process.env.APPLE_CLIENT_SECRET.trim();
  }

  const teamId = process.env.APPLE_TEAM_ID?.trim();
  const keyId = process.env.APPLE_KEY_ID?.trim();
  const clientId = process.env.APPLE_CLIENT_ID?.trim();
  const privateKey = process.env.APPLE_PRIVATE_KEY;

  if (!teamId || !keyId || !clientId || !privateKey) {
    throw new Error("Sign in with Apple is not fully configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(normalizePrivateKey(privateKey), "ES256");

  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setAudience("https://appleid.apple.com")
    .setSubject(clientId)
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60 * 24 * 150)
    .sign(key);
}
