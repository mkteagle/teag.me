import type { Metadata } from "next";
import Link from "next/link";
import { TeagWordmark } from "@/components/brand/teag-mark";
import { Footer } from "@/components/layout/footer";
import { CssPlayground } from "@/components/link-pages/css-playground";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Teag.me docs",
  description: "Create QR codes, publish a link page, and customize it with CSS.",
};

export default function DocsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="full-bleed flex min-h-20 flex-wrap items-center justify-between gap-3 py-3">
          <TeagWordmark href="/" />
          <Button variant="outline" size="sm" asChild><Link href="/dashboard">Open workspace</Link></Button>
        </div>
      </header>
      <main className="full-bleed flex-1 space-y-11 py-9 sm:py-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">Teag.me docs</h1>
          <p className="mt-3 text-muted-foreground">Create codes, share links, and see what people open.</p>
          <nav aria-label="On this page" className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
            <a href="#codes" className="underline underline-offset-4">QR codes</a>
            <a href="#link-pages" className="underline underline-offset-4">Link pages</a>
            <a href="#activity" className="underline underline-offset-4">Activity</a>
            <a href="#custom-css" className="underline underline-offset-4">Custom CSS</a>
          </nav>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <section id="codes" className="scroll-mt-4 rounded-2xl border p-5">
            <h2 className="text-lg font-bold">QR codes</h2>
            <p className="mt-2 text-sm text-muted-foreground">Open Codes and create a QR code for your URL. A dynamic code lets you change the destination after sharing it.</p>
          </section>
          <section id="link-pages" className="scroll-mt-4 rounded-2xl border p-5">
            <h2 className="text-lg font-bold">Link pages</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create a page, add a profile and blocks, then publish. Use Quick add to share a new link. Open the editor to download or share the page’s QR code.</p>
            <p className="mt-2 text-sm font-medium">Free includes one link page. Pro includes unlimited link pages.</p>
          </section>
          <section id="activity" className="scroll-mt-4 rounded-2xl border p-5">
            <h2 className="text-lg font-bold">Activity</h2>
            <p className="mt-2 text-sm text-muted-foreground">See code scans, link page visits, and clicks in one timeline. Free includes seven days of analytics and 500 tracked scans each month.</p>
          </section>
        </div>
        <section id="custom-css" className="scroll-mt-4 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight">Customize a link page with CSS</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>In the editor, open <strong className="text-foreground">Custom CSS and selectors</strong>.</li>
            <li>Copy a selector for the part you want to style, or start with one of the examples below.</li>
            <li>Paste the CSS into the editor. Check the live preview and publish when ready.</li>
          </ol>
          <p className="text-sm text-muted-foreground">The page supports media queries, keyframes, and gradients. Upload images in the editor to use them in your design.</p>
          <CssPlayground />
        </section>
      </main>
      <Footer />
    </div>
  );
}
