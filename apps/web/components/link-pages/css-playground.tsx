"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { defaultContent, newBlock } from "@/lib/link-pages/model";
import { CssEditor } from "./css-editor";
import { LinkPagePreview } from "./preview";

const snippets = [
  { name: "Shorter cover", css: `#cover {
  height: 160px;
}
#avatar {
  margin-top: -42px;
  margin-bottom: 24px;
}` },
  { name: "Aurora glow", css: `#avatar {
  border-color: #d9fdf2;
  box-shadow: 0 0 15px #30e5b9,
    0 0 32px #795cff, 0 0 50px #1b6845;
}` },
  { name: "Smoke ring", css: `#avatar::before {
  content: "";
  position: absolute;
  inset: -12px;
  z-index: -1;
  border-radius: 50%;
  background: conic-gradient(transparent, #ad9983,
    transparent, #625a60, transparent);
  mask: radial-gradient(transparent 52%, black 68%, transparent 74%);
  filter: blur(3px);
  animation: smoke-drift 10s linear infinite;
}

@keyframes smoke-drift {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  #avatar::before { animation: none; }
}` },
];

const sample = {
  ...defaultContent,
  name: "Sample profile",
  bio: "A few songs, links, and things I’m working on.",
  blocks: [
    { ...newBlock("song", "song"), title: "Featured track", description: "Sample artist", url: "https://example.com" },
    { ...newBlock("video", "video"), title: "New video", url: "https://example.com" },
    { ...newBlock("blog"), title: "A note from the studio", section: "pinned" as const, url: "https://example.com" },
  ],
};

export function CssPlayground() {
  const [css, setCss] = useState(snippets[0].css);
  return <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
    <div className="min-w-0 space-y-4 rounded-2xl border bg-background p-4 sm:p-6">
      <div className="flex flex-wrap gap-2" aria-label="Load a CSS example">
        {snippets.map((snippet) => <Button key={snippet.name} variant="outline" size="sm" type="button"
          onClick={() => setCss(snippet.css)} aria-pressed={css === snippet.css}>{snippet.name}</Button>)}
        <Button variant="ghost" size="sm" type="button" onClick={() => setCss("")}>Clear</Button>
      </div>
      <CssEditor value={css} onChange={setCss} docs />
    </div>
    <LinkPagePreview content={{ ...sample, css }} slug="sample" />
  </div>;
}
