"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fingerprint, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const DISMISS_KEY = "teagme:passkey-prompt-dismissed";

function deviceLabel(): string {
  if (typeof navigator === "undefined") return "Passkey";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "iCloud Keychain (Apple)";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows Hello";
  return "Passkey";
}

/**
 * Shown on the dashboard when the signed-in user has no passkeys yet. Lets them
 * register one in a single click (WebAuthn requires a user gesture, so we can't
 * trigger registration automatically). Hidden when a passkey already exists,
 * when the browser has no WebAuthn support, or once the user dismisses it.
 */
export function PasskeyPrompt() {
  // "checking" until we know whether to show; then "show" | "hide".
  const [state, setState] = useState<"checking" | "show" | "hide">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Bail early if WebAuthn isn't available or the user already dismissed.
    if (
      typeof window === "undefined" ||
      typeof window.PublicKeyCredential === "undefined" ||
      window.sessionStorage.getItem(DISMISS_KEY) === "1"
    ) {
      setState("hide");
      return;
    }

    (async () => {
      try {
        // better-auth mounts the passkey plugin under /api/auth.
        const res = await fetch("/api/auth/passkey/list-user-passkeys", {
          credentials: "include",
        });
        if (cancelled) return;
        if (!res.ok) {
          setState("hide");
          return;
        }
        const body = await res.json();
        const list = Array.isArray(body) ? body : body?.data;
        const hasPasskey = Array.isArray(list) && list.length > 0;
        setState(hasPasskey ? "hide" : "show");
      } catch {
        // If we can't tell, stay quiet rather than nag.
        if (!cancelled) setState("hide");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
    setState("hide");
  };

  const addPasskey = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await authClient.passkey.addPasskey({ name: deviceLabel() });
      if (res?.error) {
        setError(res.error.message || "Could not add passkey.");
        return;
      }
      setState("hide");
    } catch (addError) {
      console.error("Add passkey failed:", addError);
      setError(
        addError instanceof Error ? addError.message : "Could not add passkey."
      );
    } finally {
      setBusy(false);
    }
  };

  if (state !== "show") return null;

  return (
    <div className="data-card relative mb-6 rounded-3xl p-5 md:p-6">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col gap-4 pr-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold tracking-tight">
              Sign in faster next time
            </h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              Add a passkey to sign in with Face ID, Touch ID, or your device
              passcode — no password to remember.
            </p>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={addPasskey} disabled={busy} className="gap-2">
            <Fingerprint className="h-4 w-4" />
            {busy ? "Waiting…" : "Add a passkey"}
          </Button>
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link href="/settings">Manage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
