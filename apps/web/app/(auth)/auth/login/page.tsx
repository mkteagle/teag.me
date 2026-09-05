import { LoginPageClient } from "@/components/auth/login-page-client";
import { isAppleAuthConfigured } from "@/lib/apple-client-secret";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string }>;
}) {
  const requestedCallback = (await searchParams).callbackURL;
  const callbackURL = requestedCallback?.startsWith("/") && !requestedCallback.startsWith("//")
    ? requestedCallback
    : "/dashboard";
  const providers = [
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? "google"
      : null,
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? "github"
      : null,
    isAppleAuthConfigured() ? "apple" : null,
  ].filter((provider): provider is "google" | "github" | "apple" =>
    Boolean(provider)
  );

  return <LoginPageClient providers={providers} callbackURL={callbackURL} />;
}
