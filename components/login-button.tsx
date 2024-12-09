"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get the ID token
      const idToken = await result.user.getIdToken();
      console.log("Got ID token, sending to backend...");

      // Send to backend
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      // Store the userId in localStorage and log it
      console.log("Setting userId in localStorage:", data.userId);
      window.localStorage.setItem("userId", data.userId);

      // Force a page reload to ensure AuthProvider picks up the new userId
      window.location.href = "/";
    } catch (error) {
      console.error("Login failed:", error);
      setError(error instanceof Error ? error.message : "Failed to login");
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Sign in with Google
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
