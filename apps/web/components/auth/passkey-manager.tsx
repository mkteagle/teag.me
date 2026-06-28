"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export type PasskeyRow = {
  id: string;
  name: string | null;
  deviceType: string;
  createdAt: string | Date;
};

function deviceLabel(): string {
  if (typeof navigator === "undefined") return "Passkey";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "iCloud Keychain (Apple)";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows Hello";
  return "Passkey";
}

export function PasskeyManager({ passkeys }: { passkeys: PasskeyRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPasskey = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await authClient.passkey.addPasskey({ name: deviceLabel() });
      if (res?.error) {
        setError(res.error.message || "Could not add passkey.");
      } else {
        router.refresh();
      }
    } catch (addError) {
      console.error("Add passkey failed:", addError);
      setError(
        addError instanceof Error ? addError.message : "Could not add passkey."
      );
    } finally {
      setBusy(false);
    }
  };

  const removePasskey = async (id: string) => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/passkey/delete-passkey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove passkey.");
      router.refresh();
    } catch (removeError) {
      console.error("Remove passkey failed:", removeError);
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Failed to remove passkey."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="data-card rounded-3xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Passkeys
            </h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              Sign in with Face ID, Touch ID, or your device passcode — no
              password. Passkeys are tied to your account ({" "}
              <span className="font-medium text-foreground">this email</span>).
            </p>
          </div>
        </div>
        <Button onClick={addPasskey} disabled={busy} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add a passkey
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 space-y-2">
        {passkeys.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/10 px-4 py-6 text-center text-sm text-muted-foreground">
            No passkeys yet. Add one to sign in without a password next time.
          </p>
        ) : (
          passkeys.map((pk) => (
            <div
              key={pk.id}
              className="flex items-center justify-between rounded-xl border border-black/8 bg-white/50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Fingerprint className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">
                    {pk.name || pk.deviceType || "Passkey"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Added{" "}
                    {new Date(pk.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => removePasskey(pk.id)}
                className="text-muted-foreground hover:text-red-500"
                aria-label="Remove passkey"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
