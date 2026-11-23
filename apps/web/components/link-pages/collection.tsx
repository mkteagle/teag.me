"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPage } from "@/app/(protected)/link-pages/actions";
import { slugify } from "@/lib/link-pages/model";
import { capture } from "@/lib/posthog";
import { inputClass } from "./css-editor";

export function CreateLinkPage({ name }: { name: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(name.slice(0, 100));
  const [slug, setSlug] = useState(slugify(name));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form className="rounded-2xl border p-5 sm:p-6" onSubmit={async (event) => {
      event.preventDefault();
      setPending(true);
      setError("");
      try {
        const result = await createPage(slug, displayName);
        if ("error" in result) setError(result.error ?? "Could not create the page.");
        else {
          capture("link_page_created");
          router.push(`/link-pages/${result.id}`);
        }
      } catch {
        setError("Could not create the page. Try again.");
      } finally {
        setPending(false);
      }
    }}>
      <h2 className="text-xl font-bold tracking-tight">Create a link page</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold"><span>Display name</span>
          <input required maxLength={100} value={displayName} className={inputClass} onChange={(event) => setDisplayName(event.target.value)} />
        </label>
        <label className="space-y-2 text-sm font-semibold"><span>Page address</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">teag.me/u/</span>
            <input required minLength={3} maxLength={40} pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={slug} className={inputClass} autoCapitalize="none" spellCheck={false}
              onChange={(event) => setSlug(event.target.value.toLowerCase())} />
          </div>
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
      <Button className="mt-4" disabled={pending}>{pending ? "Creating…" : "Create page"}</Button>
    </form>
  );
}
