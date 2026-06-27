import type { Metadata } from "next";
import Link from "next/link";
import {
  AppStoreBadge,
  ScannerWordmark,
} from "@/components/scanner/scanner-brand";
import {
  GalleryPermission,
  GalleryResult,
  GalleryScanner,
  GalleryWifi,
  HeroPhone,
} from "@/components/scanner/phone-mockups";

export const metadata: Metadata = {
  title: "teag.me Scanner | See the real link before you tap",
  description:
    "A free, private iOS QR scanner. teag.me reads any QR code instantly and shows you exactly where it goes — decoded on-device, with no account and no tracking.",
  openGraph: {
    title: "teag.me Scanner | See the real link before you tap",
    description:
      "Free iOS QR scanner that decodes on-device and shows the true destination before you open it. No account. No tracking.",
    url: "/scanner",
    type: "website",
  },
};

const FEATURES = [
  {
    eyebrow: "⚡ INSTANT",
    title: "Instant decode",
    body: "Point and read. The link appears the moment a code enters frame — no shutter, no wait.",
  },
  {
    eyebrow: "🔎 TRUE LINK",
    title: "See the true destination",
    body: "The full domain and URL, in plain sight — so a shortened or spoofed code can't fool you.",
  },
  {
    eyebrow: "🔒 PRIVATE",
    title: "Private, on-device",
    body: "Decoding happens entirely on your phone. Nothing is uploaded, logged, or tracked.",
  },
];

const TRUST_CHIPS = ["No sign-up", "No analytics SDK", "On-device decode"];

export default function ScannerLandingPage() {
  return (
    <main className="w-full bg-[#F6F4EF] text-foreground">
      {/* nav */}
      <nav className="full-bleed flex items-center justify-between py-6">
        <Link href="/scanner">
          <ScannerWordmark />
        </Link>
        <div className="flex items-center gap-7 text-sm font-medium text-[#3C424E]">
          <Link href="/" className="hidden sm:inline hover:text-foreground">
            ← teag.me
          </Link>
          <Link href="/scanner/privacy" className="hidden sm:inline hover:text-foreground">
            Privacy
          </Link>
          <Link href="/scanner/terms" className="hidden sm:inline hover:text-foreground">
            Terms
          </Link>
          <a
            href="#"
            className="rounded-[10px] bg-[#15181F] px-4 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Download
          </a>
        </div>
      </nav>

      {/* hero */}
      <section className="full-bleed grid items-center gap-16 py-12 pb-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-teag-rise">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1.5 font-mono text-[11.5px] tracking-[0.08em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            FREE · iOS
          </div>
          <h1 className="mb-[22px] font-heading text-[44px] font-extrabold leading-[0.99] tracking-[-0.035em] sm:text-[56px] lg:text-[62px]">
            Scan any QR code.
            <br />
            See the real link
            <br />
            before you tap.
          </h1>
          <p className="mb-8 max-w-[480px] text-lg leading-[1.5] text-[#4A505C]">
            teag.me scanner reads any QR code instantly and shows you exactly
            where it goes — so you can trust it before you open it.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <AppStoreBadge href="#" />
            <div className="font-mono text-xs leading-[1.5] text-[#7A8190]">
              Free · No account
              <br />
              iOS 16+
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <HeroPhone />
        </div>
      </section>

      {/* why it's different */}
      <section className="full-bleed py-6">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-[18px] border border-[rgba(21,24,31,0.09)] bg-[#FFFDF8] p-7"
            >
              <div className="mb-3 font-mono text-[11px] text-primary">
                {f.eyebrow}
              </div>
              <h3 className="mb-2 font-heading text-xl font-bold tracking-[-0.02em]">
                {f.title}
              </h3>
              <p className="text-sm leading-[1.55] text-[#5A606C]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* screenshot gallery */}
      <section className="full-bleed pb-8 pt-16">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-[34px] font-bold tracking-[-0.03em]">
            A look inside the app
          </h2>
          <span className="font-mono text-[11.5px] text-[#7A8190]">
            SCAN · RESULT · WI-FI · PERMISSION
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-7">
          <GalleryScanner />
          <GalleryResult />
          <GalleryWifi />
          <GalleryPermission />
        </div>
      </section>

      {/* trust / privacy callout */}
      <section className="full-bleed py-16">
        <div className="relative overflow-hidden rounded-[24px] bg-[#15181F] px-6 py-14 text-center text-[#FFFDF8] sm:px-12">
          <div className="mb-[18px] font-mono text-[11.5px] tracking-[0.14em] text-primary">
            PRIVACY BY DESIGN
          </div>
          <h2 className="mx-auto mb-3.5 max-w-[760px] font-heading text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#FFFDF8] sm:text-[44px]">
            No accounts. No tracking.
            <br />
            Your scans stay on your phone.
          </h2>
          <p className="mx-auto max-w-[560px] text-base text-[#B7BDC8]">
            Every QR code is decoded locally. teag.me scanner never asks who you
            are and never phones home.
          </p>
          <div className="mt-[30px] flex flex-wrap justify-center gap-3.5">
            {TRUST_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 font-mono text-xs text-[#E5E7EB]"
              >
                ○ {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* read the policies */}
      <section className="full-bleed grid gap-5 pb-12 md:grid-cols-2">
        <Link
          href="/scanner/privacy"
          className="data-card group rounded-[18px] p-9"
        >
          <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-[#7A8190]">
            teag.me/scanner/privacy
          </div>
          <h3 className="mb-1.5 font-heading text-2xl font-bold tracking-[-0.025em]">
            Privacy Policy
          </h3>
          <p className="text-sm leading-[1.7] text-[#3C424E]">
            How the scanner handles your camera and scans — short version: it
            doesn&apos;t leave your device.{" "}
            <span className="font-medium text-primary group-hover:underline">
              Read it →
            </span>
          </p>
        </Link>
        <Link
          href="/scanner/terms"
          className="data-card group rounded-[18px] p-9"
        >
          <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-[#7A8190]">
            teag.me/scanner/terms
          </div>
          <h3 className="mb-1.5 font-heading text-2xl font-bold tracking-[-0.025em]">
            Terms of Service
          </h3>
          <p className="text-sm leading-[1.7] text-[#3C424E]">
            The plainspoken terms for using the free app, provided as is.{" "}
            <span className="font-medium text-primary group-hover:underline">
              Read it →
            </span>
          </p>
        </Link>
      </section>

      {/* footer */}
      <footer className="w-full bg-[#15181F] text-[#FFFDF8]">
        <div className="full-bleed flex flex-wrap items-center justify-between gap-4 py-12">
          <ScannerWordmark
            wordmarkClassName="text-[#FFFDF8] text-[17px]"
            dotStroke="#15181F"
          />
          <div className="flex flex-wrap gap-6 text-[13.5px] text-[#9AA1AE]">
            <Link href="/" className="hover:text-white">
              ← Back to teag.me
            </Link>
            <Link href="/scanner/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/scanner/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
          <div className="font-mono text-[11px] text-[#6B7280]">
            © 2026 teag.me
          </div>
        </div>
      </footer>
    </main>
  );
}
