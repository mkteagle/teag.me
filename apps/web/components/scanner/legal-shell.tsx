import Link from "next/link";
import { ScannerWordmark } from "@/components/scanner/scanner-brand";

/**
 * Clean, single-column reading shell for the scanner legal pages.
 * Sora headings, Inter body, ~720px measure, generous spacing, no decoration.
 */
export function LegalShell({
  eyebrow,
  title,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="w-full bg-[#F6F4EF] text-foreground">
      {/* simple header */}
      <header className="full-bleed flex items-center justify-between border-b border-[rgba(21,24,31,0.08)] py-6">
        <Link href="/scanner">
          <ScannerWordmark />
        </Link>
        <Link
          href="/scanner"
          className="text-sm font-medium text-[#3C424E] hover:text-foreground"
        >
          ← Back to QR Code
        </Link>
      </header>

      <article className="mx-auto w-full max-w-[720px] px-5 py-16 sm:py-20">
        <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-[#7A8190]">
          {eyebrow}
        </div>
        <h1 className="mb-2 font-heading text-4xl font-bold tracking-[-0.03em] sm:text-[44px]">
          {title}
        </h1>
        <p className="mb-10 font-mono text-xs text-[#9AA1AE]">
          Last updated: {lastUpdated}
        </p>
        <div className="space-y-9 text-[15px] leading-[1.7] text-[#3C424E] [&_a]:text-primary [&_a:hover]:underline">
          {children}
        </div>
      </article>

      <footer className="w-full bg-[#15181F] text-[#FFFDF8]">
        <div className="full-bleed flex flex-wrap items-center justify-between gap-4 py-10">
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

/** A titled section: Sora H2 + body. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
