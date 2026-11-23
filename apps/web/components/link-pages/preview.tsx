"use client";

import { useDeferredValue, useMemo } from "react";
import type { LinkPageContent } from "@/lib/link-pages/model";
import { renderLinkPage } from "@/lib/link-pages/render";

export function LinkPagePreview({ content, slug }: { content: LinkPageContent; slug: string }) {
  const preview = useDeferredValue(content);
  const html = useMemo(() => renderLinkPage(preview, slug), [preview, slug]);
  return (
    <iframe title="Live link page preview" sandbox="" referrerPolicy="no-referrer" srcDoc={html}
      className="h-[min(48rem,80vh)] min-h-[27rem] w-full rounded-2xl border bg-[#1c1c1c]" />
  );
}
