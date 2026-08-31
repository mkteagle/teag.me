import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppStoreBadge, ScannerWordmark } from "@/components/scanner/scanner-brand";

export const metadata: Metadata = {
  title: "teag.me Scanner | Know where a QR code goes",
  description: "Scan QR codes and screenshots on iPhone, inspect the real destination before opening it, and optionally sync URL-only history to teag.me.",
  openGraph: {
    title: "teag.me Scanner | Know where a QR code goes",
    description: "A fast, private QR scanner for iPhone with destination previews, photo scanning, and optional URL history sync.",
    url: "/scanner",
    type: "website",
  },
};

const STORE_URL = "https://apps.apple.com/app/id6784932487";

const FEATURES = [
  { number: "01", title: "See the destination first", body: "Read the full domain and URL before deciding whether to open it. Short links and teag.me codes resolve to their actual destination." },
  { number: "02", title: "Scan screenshots too", body: "Choose a saved image or screenshot and decode it on-device—no camera juggling and no image upload." },
  { number: "03", title: "Keep the links that matter", body: "URL history stays local by default. Sign in only when you want up to 100 links synced free across teag.me." },
];

const SHOTS = [
  { src: "/scanner/screenshots/01_scan.png", alt: "teag.me Scanner framing a QR code", className: "lg:-rotate-2" },
  { src: "/scanner/screenshots/02_link.png", alt: "teag.me Scanner showing the real URL before opening", className: "lg:translate-y-10 lg:rotate-2" },
  { src: "/scanner/screenshots/03_history.png", alt: "teag.me Scanner URL history synced to teag.me", className: "lg:-rotate-1" },
  { src: "/scanner/screenshots/04_photo.png", alt: "teag.me Scanner decoding a QR code from Photos", className: "lg:translate-y-10 lg:rotate-1" },
  { src: "/scanner/screenshots/05_privacy.png", alt: "teag.me Scanner camera permission screen", className: "lg:-rotate-2" },
];

export default function ScannerLandingPage() {
  return (
    <main className="w-full overflow-hidden bg-[#F5F2EA] text-[#15181F]">
      <nav className="full-bleed flex items-center justify-between py-6">
        <Link href="/scanner" aria-label="teag.me Scanner home"><ScannerWordmark /></Link>
        <div className="flex items-center gap-6 text-sm font-medium text-[#4A505C]">
          <a href="#features" className="hidden hover:text-[#15181F] sm:inline">Features</a>
          <a href="#pricing" className="hidden hover:text-[#15181F] sm:inline">Pricing</a>
          <Link href="/scanner/privacy" className="hidden hover:text-[#15181F] md:inline">Privacy</Link>
          <a href={STORE_URL} className="rounded-xl bg-[#15181F] px-4 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5">Get the app</a>
        </div>
      </nav>

      <section className="full-bleed grid items-center gap-12 pb-20 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:pb-28 lg:pt-16">
        <div className="relative z-10 animate-teag-rise">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0F7BFF]/20 bg-[#0F7BFF]/[0.08] px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-[#0F7BFF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A3D]" /> PRIVATE QR SCANNER FOR IPHONE
          </div>
          <h1 className="max-w-[680px] font-heading text-[50px] font-extrabold leading-[0.94] tracking-[-0.05em] sm:text-[68px] lg:text-[76px]">Know where it goes <span className="text-[#0F7BFF]">before</span> you tap.</h1>
          <p className="mt-7 max-w-[560px] text-lg leading-[1.6] text-[#4A505C] sm:text-xl">Scan any QR code or screenshot, reveal the real destination, and open it only when it looks right.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <AppStoreBadge href={STORE_URL} />
            <div className="font-mono text-[11px] leading-[1.6] tracking-[0.04em] text-[#717784]">FREE TO SCAN<br />NO ACCOUNT REQUIRED</div>
          </div>
          <div className="mt-9 flex flex-wrap gap-2.5 text-xs font-medium text-[#4A505C]">
            {['On-device decode', 'Scan from Photos', 'Optional cloud history'].map((item) => <span key={item} className="rounded-full border border-[#15181F]/10 bg-white/60 px-3 py-2">✓ {item}</span>)}
          </div>
        </div>

        <div className="relative mx-auto h-[650px] w-full max-w-[640px] sm:h-[760px]">
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0F7BFF]/15 blur-3xl" />
          <Image src="/scanner/screenshots/01_scan.png" alt="teag.me Scanner reading a QR code" width={1320} height={2868} priority className="absolute left-[4%] top-[8%] w-[42%] -rotate-6 rounded-[24px] shadow-[0_35px_90px_rgba(17,24,39,0.25)]" />
          <Image src="/scanner/screenshots/02_link.png" alt="teag.me Scanner previewing a decoded destination" width={1320} height={2868} priority className="absolute right-[3%] top-0 w-[47%] rotate-6 rounded-[28px] shadow-[0_40px_100px_rgba(17,24,39,0.3)]" />
          <div className="absolute bottom-[7%] left-[8%] rounded-2xl border border-white/70 bg-white/85 p-4 shadow-xl backdrop-blur sm:p-5">
            <div className="font-mono text-[9px] tracking-[0.14em] text-[#0F7BFF]">DESTINATION REVEALED</div><div className="mt-1 font-heading text-lg font-bold">marriott.com</div><div className="mt-0.5 font-mono text-[10px] text-[#717784]">You decide what opens.</div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#15181F] text-[#FFFDF8]">
        <div className="full-bleed py-20 lg:py-28">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div className="font-mono text-[11px] tracking-[0.16em] text-[#0F7BFF]">BUILT FOR THE MOMENT OF DOUBT</div>
            <h2 className="font-heading text-[40px] font-extrabold leading-[1] tracking-[-0.04em] sm:text-[54px]">A scanner should answer one question clearly.</h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 md:grid-cols-3">
            {FEATURES.map((feature) => <article key={feature.number} className="bg-[#15181F] p-8 sm:p-10"><div className="font-mono text-xs text-[#FF8A3D]">{feature.number}</div><h3 className="mt-10 font-heading text-2xl font-bold tracking-[-0.025em]">{feature.title}</h3><p className="mt-3 text-sm leading-[1.7] text-[#AEB4C0]">{feature.body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="full-bleed py-20 lg:py-28">
        <div className="mb-12 max-w-[720px]">
          <div className="font-mono text-[11px] tracking-[0.16em] text-[#0F7BFF]">THE REAL APP · NOT A MOCKUP</div>
          <h2 className="mt-4 font-heading text-[40px] font-extrabold leading-[1] tracking-[-0.04em] sm:text-[54px]">Camera, screenshots, and useful history.</h2>
          <p className="mt-5 text-lg leading-[1.6] text-[#5A606C]">Every screen below is captured from the iPhone app and styled with the same campaign system used for its App Store listing.</p>
        </div>
        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {SHOTS.map((shot) => <Image key={shot.src} src={shot.src} alt={shot.alt} width={1320} height={2868} loading="eager" className={`w-full rounded-[18px] shadow-[0_24px_60px_rgba(17,24,39,0.18)] transition-transform duration-300 hover:-translate-y-2 ${shot.className}`} />)}
        </div>
      </section>

      <section id="pricing" className="full-bleed pb-20 lg:pb-28">
        <div className="grid overflow-hidden rounded-[28px] bg-[#0F7BFF] text-white lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="font-mono text-[11px] tracking-[0.16em] text-white/70">SCAN FREE · UPGRADE WHEN IT EARNS ITS PLACE</div>
            <h2 className="mt-5 max-w-[620px] font-heading text-[40px] font-extrabold leading-[1] tracking-[-0.04em] sm:text-[54px]">Scanning stays free. Pro connects the bigger toolkit.</h2>
            <p className="mt-5 max-w-[590px] text-base leading-[1.7] text-white/80">No account is required to scan. A free account syncs 100 URL captures and includes 10 active dynamic QR codes on teag.me.</p>
          </div>
          <div className="m-3 rounded-[22px] bg-[#101217] p-8 text-[#FFFDF8] sm:p-10 lg:m-4">
            <div className="font-mono text-[10px] tracking-[0.16em] text-[#FF8A3D]">TEAG.ME PRO</div>
            <div className="mt-2 font-heading text-4xl font-extrabold">$2.99<span className="text-sm font-normal text-[#9AA1AE]"> / month</span></div>
            <ul className="mt-8 space-y-4 text-sm text-[#D3D7DE]"><li>✓ Unlimited cloud-synced scanner history</li><li>✓ 100 active dynamic QR codes</li><li>✓ 50,000 tracked scans each month</li><li>✓ Full teag.me web toolkit</li></ul>
            <AppStoreBadge href={STORE_URL} className="mt-8 w-full justify-center border border-white/10 bg-white text-[#15181F] shadow-none" />
            <p className="mt-4 text-center text-[11px] leading-[1.5] text-[#777E8B]">Auto-renews monthly. Cancel anytime in App Store settings.</p>
          </div>
        </div>
      </section>

      <footer className="w-full bg-[#15181F] text-[#FFFDF8]">
        <div className="full-bleed flex flex-wrap items-center justify-between gap-5 py-12">
          <ScannerWordmark wordmarkClassName="text-[#FFFDF8] text-[17px]" dotStroke="#15181F" />
          <div className="flex flex-wrap gap-6 text-[13px] text-[#9AA1AE]"><Link href="/">teag.me web</Link><Link href="/scanner/privacy">Privacy</Link><Link href="/scanner/terms">Terms</Link></div>
          <div className="font-mono text-[11px] text-[#6B7280]">© 2026 teag.me</div>
        </div>
      </footer>
    </main>
  );
}
