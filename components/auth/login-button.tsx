"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Provider = "google" | "github" | "apple";

const PROVIDER_LABELS: Record<Provider, string> = {
  google: "Continue with Google",
  github: "Continue with GitHub",
  apple: "Continue with Apple",
};

const PROVIDER_CLASSES: Record<Provider, string> = {
  google: "bg-white text-gray-900 hover:bg-gray-100",
  github: "bg-[#171515] text-white hover:bg-black",
  apple: "bg-black text-white hover:bg-gray-900",
};

export default function LoginButton({
  providers,
}: {
  providers: Provider[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleLogin = async (provider: Provider) => {
    try {
      setError(null);
      setLoadingProvider(provider);
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch (loginError) {
      console.error("Login failed:", loginError);
      setError(
        loginError instanceof Error ? loginError.message : "Failed to login"
      );
      setLoadingProvider(null);
    }
  };

  if (providers.length === 0) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-muted-foreground">
          Social sign-in is not configured yet.
        </p>
        <p className="text-xs text-muted-foreground">
          Add provider credentials for Google, GitHub, or Apple in `.env.local`
          to enable login.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <Button
          key={provider}
          onClick={() => handleLogin(provider)}
          className={`w-full flex items-center justify-center gap-2 ${PROVIDER_CLASSES[provider]}`}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === provider
            ? "Redirecting..."
            : PROVIDER_LABELS[provider]}
        </Button>
      ))}

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
