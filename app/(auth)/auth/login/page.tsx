import { LoginPageClient } from "@/components/auth/login-page-client";

export default function LoginPage() {
  const providers = [
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? "google"
      : null,
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? "github"
      : null,
    process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? "apple"
      : null,
  ].filter((provider): provider is "google" | "github" | "apple" =>
    Boolean(provider)
  );

  return <LoginPageClient providers={providers} />;
}
