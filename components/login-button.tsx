"use client";

import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isProduction = process.env.NEXT_PUBLIC_ENV === "production";

  const handleLogin = async (provider: "google" | "apple") => {
    try {
      setError(null);
      const authProvider =
        provider === "google"
          ? new GoogleAuthProvider()
          : new OAuthProvider("apple.com");

      const result = await signInWithPopup(auth, authProvider);
      const idToken = await result.user.getIdToken();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      window.localStorage.setItem("userId", data.userId);
      window.location.href = "/";
    } catch (error) {
      console.error("Login failed:", error);
      setError(error instanceof Error ? error.message : "Failed to login");
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => handleLogin("google")}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      {isProduction && (
        <Button
          onClick={() => handleLogin("apple")}
          className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M17.05 20.28c-.98.95-2.05.94-3.12.47-1.12-.48-2.14-.48-3.31 0-1.47.62-2.25.44-3.12-.47C3.11 15.46 3.74 8.07 8.42 7.75c1.33.07 2.25.49 3.03.49.77 0 2.22-.59 3.74-.5 1.25.1 2.38.52 3.22 1.33-2.96 1.82-2.47 5.41.62 6.62-.71 1.83-1.66 3.64-2.98 4.59M13 7.5c-.12-2.48 1.95-4.63 4.36-4.75.23 2.58-2.22 4.9-4.36 4.75"
            />
          </svg>
          Continue with Apple
        </Button>
      )}

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
