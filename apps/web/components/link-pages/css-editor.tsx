"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { maxCssLength, selectors } from "@/lib/link-pages/model";

export const inputClass = "w-full min-w-0 rounded-xl border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-accent";

export function CssEditor({ value, onChange, docs = false }: { value: string; onChange: (value: string) => void; docs?: boolean }) {
  const id = useId();
  const [copied, setCopied] = useState("");
  const [copyFailed, setCopyFailed] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor={id}>Custom CSS</label>
        <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} spellCheck={false}
          rows={8} maxLength={maxCssLength} className={`${inputClass} font-mono font-normal`}
          placeholder="#cover { height: 160px; }" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>Styles apply to the live preview and the published link page.</p>
        {!docs && <Link href="/docs#custom-css" target="_blank" className="font-semibold underline underline-offset-4">CSS guide</Link>}
      </div>
      <details className="rounded-xl border p-3">
        <summary className="cursor-pointer text-sm font-semibold">CSS selectors</summary>
        <ul className="mt-2 divide-y">
          {selectors.map(([name, selector]) => (
            <li key={selector} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1">
              <span className="text-sm">{name}</span>
              <Button variant="ghost" size="sm" type="button" className="font-mono text-xs"
                aria-label={`Copy ${selector}`} onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(selector);
                    setCopied(selector);
                    setCopyFailed(false);
                  } catch {
                    setCopyFailed(true);
                  }
                }}>{selector} {copied === selector && "✓"}</Button>
            </li>
          ))}
        </ul>
        <p role="status" className="sr-only">{copyFailed ? "Select the selector text to copy it manually." : copied && `Copied ${copied}`}</p>
      </details>
    </div>
  );
}
