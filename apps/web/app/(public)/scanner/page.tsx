import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppStoreBadge, ScannerWordmark } from "@/components/scanner/scanner-brand";

export const metadata: Metadata = {
  title: "QR Code by teag.me | Scan, preview, create",
  description: "Preview QR destinations, scan from Photos, and create and track QR codes on iPhone.",
  openGraph: { title: "QR Code by teag.me", url: "/scanner", type: "website" },
};

const storeUrl = "https://apps.apple.com/app/id6784932487";

const features = [
  ["Preview the destination", "See the domain and full URL before you decide to open it."],
  ["Scan from your camera or Photos", "Decode a QR code on your iPhone without uploading the image."],
  ["Create and track codes", "Make a static code without an account, or sign in to create editable teag.me codes and see scan analytics."],
];

export default function ScannerPage() {
  return (
    <>
      <header className="border-b">
        <div className="full-bleed flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/" aria-label="teag.me home"><ScannerWordmark showTag={false} /></Link>
          <nav aria-label="Scanner" className="flex items-center gap-5 text-sm font-semibold">
            <Link href="#details" className="hover:text-accent">Features</Link>
            <Link href="#pricing" className="hover:text-accent">Pricing</Link>
            <a href={storeUrl} className="hidden hover:text-accent sm:inline" data-marketing-cta="app_store_header">Get the app</a>
          </nav>
        </div>
      </header>
      <main className="full-bleed">
        <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <h1 className="max-w-[13ch] text-[clamp(2.5rem,6vw,5.1rem)] font-extrabold leading-[0.98] tracking-[-0.065em]">See where a QR code goes</h1>
            <p className="mt-5 max-w-[39ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              Scan with your iPhone and preview the destination before opening it. You can also create and share your own codes.
            </p>
            <div className="mt-7"><AppStoreBadge href={storeUrl} analyticsAction="app_store_hero" /></div>
            <p className="mt-3 text-sm text-muted-foreground">Free to scan and create static codes.</p>
          </div>
          <div className="mx-auto w-full max-w-[290px] overflow-hidden rounded-[26px] border bg-card">
            <Image src="/scanner/screenshots/saffron-link.webp" alt="QR Code by teag.me showing a link preview on iPhone" width={600} height={1304} className="h-auto w-full" priority />
          </div>
        </section>

        <section id="details" className="grid scroll-mt-6 gap-7 border-y py-8 sm:grid-cols-3 sm:py-11" aria-label="Scanner features">
          {features.map(([name, detail]) => <div key={name}><h2 className="text-lg font-bold">{name}</h2><p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">{detail}</p></div>)}
        </section>

        <section id="pricing" className="grid scroll-mt-6 gap-5 py-12 sm:grid-cols-2 sm:py-16">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Scanner pricing</h2>
            <p className="mt-3 max-w-[39ch] leading-relaxed text-muted-foreground">Scanning and static codes are free. A free account can sync 100 URL captures and create up to 10 active dynamic codes.</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="text-lg font-bold">teag.me Pro</h3>
            <p className="my-3 text-3xl font-extrabold">$2.99 <span className="text-sm font-medium text-muted-foreground">per month</span></p>
            <p className="mb-5 text-sm text-muted-foreground">Unlimited synced history and active dynamic codes, with up to 50,000 tracked scans per month.</p>
            <AppStoreBadge href={storeUrl} analyticsAction="app_store_pricing" />
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="full-bleed flex flex-wrap items-center justify-between gap-4 py-6 text-sm text-muted-foreground">
          <Link href="/" aria-label="teag.me home"><ScannerWordmark showTag={false} logoSize={22} /></Link>
          <nav className="flex flex-wrap gap-4" aria-label="Footer">
            <Link href="/scanner/privacy">Privacy</Link><Link href="/scanner/terms">Terms</Link><Link href="/scanner/delete-account">Delete account</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
