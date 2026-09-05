"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function DeleteAccountClient() {
  const { data: session, isPending } = authClient.useSession();
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");

  if (isPending) {
    return <p className="text-sm text-[#7A8190]">Checking your account…</p>;
  }

  if (deleted) {
    return (
      <div className="rounded-2xl border border-emerald-600/20 bg-emerald-50 p-6">
        <h2 className="font-heading text-xl font-bold text-emerald-950">Account deleted</h2>
        <p className="mt-2 text-sm text-emerald-900">Your teag.me account and synced data have been permanently deleted.</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="font-heading text-xl font-bold">Sign in to delete your account</h2>
        <p className="mt-2 text-sm text-[#5F6673]">Use the same sign-in method and account you use in QR Code by teag.me.</p>
        <Link href="/auth/login?callbackURL=/scanner/delete-account" className="mt-5 inline-flex rounded-xl bg-[#0F7BFF] px-5 py-3 text-sm font-bold text-white hover:bg-[#086AD9]">
          Sign in
        </Link>
      </div>
    );
  }

  const deleteAccount = async () => {
    const confirmed = window.confirm("Permanently delete your profile, synced URL history, tracked QR codes, and scan analytics? This cannot be undone. Apple subscriptions must be canceled separately.");
    if (!confirmed) return;
    setDeleting(true);
    setError("");
    const result = await authClient.deleteUser();
    setDeleting(false);
    if (result.error) {
      setError(result.error.message || "We could not delete your account. Please try again or contact privacy@teag.me.");
      return;
    }
    setDeleted(true);
  };

  return (
    <div className="rounded-2xl border border-red-600/20 bg-white p-6">
      <p className="text-sm text-[#5F6673]">Signed in as <strong className="text-[#15181F]">{session.user.email}</strong></p>
      <button type="button" disabled={deleting} onClick={deleteAccount} className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
        {deleting ? "Deleting…" : "Permanently delete my account"}
      </button>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}
