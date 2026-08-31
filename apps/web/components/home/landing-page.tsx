import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TeagMark } from "@/components/brand/teag-mark";
import {
  MiniQR,
  HeroAreaChart,
  DashboardLineChart,
  DevicesDonut,
  GeographyBars,
  DeviceBars,
  MapPins,
} from "@/components/home/marketing-visuals";

const MONO = "var(--font-mono)";
const HEADING = "var(--font-heading)";

const HAIRLINE = "border-[#15181F]/[0.09]";

/* ----------------------------------------------------------------------- *
 * Top navigation
 * ----------------------------------------------------------------------- */

function Nav() {
  return (
    <header className="full-bleed flex items-center justify-between py-[26px]">
      <Link href="/" className="flex items-center gap-2.5">
        <TeagMark
          tileClassName="h-[30px] w-[30px] rounded-[9px]"
          className="h-[18px] w-[18px]"
        />
        <span
          className="text-[19px] text-[#15181F]"
          style={{ fontFamily: HEADING, fontWeight: 700, letterSpacing: "-0.025em" }}
        >
          teag.me
        </span>
      </Link>

      <nav className="flex items-center gap-[30px] text-[14.5px] font-medium text-[#3C424E]">
        <Link href="#product" className="hidden hover:text-[#15181F] sm:inline">
          Product
        </Link>
        <Link href="#pricing" className="hidden hover:text-[#15181F] sm:inline">
          Pricing
        </Link>
        <Link href="/scanner" className="hidden hover:text-[#15181F] sm:inline">
          Scanner app
        </Link>
        <Button asChild className="h-auto rounded-[10px] px-[18px] py-2.5 text-[14px]">
          <Link href="/auth/login">Create a code</Link>
        </Button>
      </nav>
    </header>
  );
}

/* ----------------------------------------------------------------------- *
 * Hero
 * ----------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="full-bleed grid items-center gap-12 pb-[84px] pt-[44px] lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
      <div className="animate-teag-rise">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0F7BFF]/[0.16] bg-[#0F7BFF]/[0.08] px-3 py-1.5 text-[11.5px] text-[#0F7BFF]"
          style={{ fontFamily: MONO, letterSpacing: "0.08em" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A3D]" />
          FREE ANALYTICS BY DEFAULT
        </div>

        <h1
          className="mb-[22px] text-[44px] text-[#15181F] sm:text-[56px] lg:text-[64px]"
          style={{ fontWeight: 800, lineHeight: 0.98, letterSpacing: "-0.035em" }}
        >
          Free QR tracking
          <br />
          without the paywall
        </h1>

        <p className="mb-8 max-w-[460px] text-[18.5px] leading-[1.5] text-[#4A505C]">
          Generate branded QR codes, shorten links, and see exactly what happens after
          every scan — geography, devices, and trends. No upsell to read the basics.
        </p>

        <div className="mb-[30px] flex flex-wrap items-center gap-[13px]">
          <Button
            asChild
            className="h-auto rounded-[12px] px-[26px] py-3.5 text-[15.5px] shadow-[0_8px_24px_rgba(15,123,255,0.28)]"
          >
            <Link href="/auth/login">Create a code</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto rounded-[12px] border-[#15181F]/[0.14] bg-[#FFFDF8] px-[22px] py-3.5 text-[15.5px] text-[#15181F]"
          >
            <Link href="/dashboard">See a live demo →</Link>
          </Button>
        </div>

        <div
          className="text-[12px] text-[#7A8190]"
          style={{ fontFamily: MONO, letterSpacing: "0.02em" }}
        >
          Tag it.&nbsp;&nbsp;Share it.&nbsp;&nbsp;Track it.
        </div>
      </div>

      {/* hero product visual */}
      <div className="relative animate-teag-rise">
        <div
          className={`relative rounded-[22px] border ${HAIRLINE} bg-[#FFFDF8] p-6 shadow-[0_24px_70px_rgba(17,24,39,0.10),0_4px_16px_rgba(17,24,39,0.05)]`}
        >
          <div className="mb-[18px] flex items-center gap-3.5">
            <div className="rounded-[16px] border border-[#15181F]/[0.08] bg-white p-[11px] shadow-[0_4px_14px_rgba(17,24,39,0.05)]">
              <MiniQR px={84} color="#15181F" seed="hero" />
            </div>
            <div>
              <div
                className="text-[12px] font-semibold text-[#0F7BFF]"
                style={{ fontFamily: MONO }}
              >
                teag.me/launch
              </div>
              <div className="mt-[3px] text-[15px]" style={{ fontFamily: HEADING, fontWeight: 700 }}>
                Spring Launch
              </div>
              <div className="mt-0.5 text-[12.5px] text-[#7A8190]">Linked → acme.com/spring</div>
              <div
                className="mt-[9px] inline-flex items-center gap-[5px] rounded-md bg-[#16A34A]/10 px-2 py-[3px] text-[10.5px] text-[#16A34A]"
                style={{ fontFamily: MONO }}
              >
                <span className="h-[5px] w-[5px] rounded-full bg-[#16A34A]" />
                LIVE
              </div>
            </div>
          </div>

          <div className="border-t border-[#15181F]/[0.07] pt-4">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div
                  className="text-[10.5px] text-[#7A8190]"
                  style={{ fontFamily: MONO, letterSpacing: "0.08em" }}
                >
                  SCANS · LAST 14 DAYS
                </div>
                <div
                  className="text-[28px]"
                  style={{ fontFamily: HEADING, fontWeight: 700, letterSpacing: "-0.02em" }}
                >
                  8,412
                </div>
              </div>
              <div
                className="text-[12px] font-semibold text-[#16A34A]"
                style={{ fontFamily: MONO }}
              >
                ▲ 23.4%
              </div>
            </div>
            <HeroAreaChart />
          </div>
        </div>

        <div className="absolute -bottom-[18px] -left-[18px] rounded-[14px] bg-[#15181F] px-[15px] py-3 text-[#FFFDF8] shadow-[0_14px_34px_rgba(17,24,39,0.22)]">
          <div
            className="text-[9.5px] text-[#9AA1AE]"
            style={{ fontFamily: MONO, letterSpacing: "0.1em" }}
          >
            TOP REGION
          </div>
          <div className="mt-0.5 text-[15px]" style={{ fontFamily: HEADING, fontWeight: 700 }}>
            🇺🇸 United States · 41%
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- *
 * Trust strip
 * ----------------------------------------------------------------------- */

function TrustStrip() {
  const places = ["Packaging", "Menus", "Events", "Posters", "Products", "Storefronts"];
  return (
    <div className="border-y border-[#15181F]/[0.08] bg-[#FFFDF8]/50">
      <div className="full-bleed flex flex-wrap items-center justify-between gap-6 py-[22px]">
        <span
          className="text-[11.5px] text-[#7A8190]"
          style={{ fontFamily: MONO, letterSpacing: "0.1em" }}
        >
          WORKS EVERYWHERE YOU SHOW UP
        </span>
        <div className="flex flex-wrap gap-[30px] text-[15px] text-[#3C424E]">
          {places.map((p) => (
            <span key={p} style={{ fontFamily: HEADING, fontWeight: 600 }}>
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 * Three pillars
 * ----------------------------------------------------------------------- */

function PillarCard({ children }: { children: ReactNode }) {
  return (
    <div
      className={`rounded-[18px] border ${HAIRLINE} bg-[#FFFDF8] p-6 shadow-[0_12px_40px_rgba(17,24,39,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(17,24,39,0.09)]`}
    >
      {children}
    </div>
  );
}

function Pillars() {
  return (
    <section className="full-bleed pb-[30px] pt-[84px]">
      <div className="mb-[42px] max-w-[560px]">
        <div
          className="mb-3.5 text-[11.5px] text-[#0F7BFF]"
          style={{ fontFamily: MONO, letterSpacing: "0.1em" }}
        >
          WHY TEAG.ME
        </div>
        <h2
          className="text-[40px]"
          style={{ fontFamily: HEADING, fontWeight: 700, lineHeight: 1.04, letterSpacing: "-0.03em" }}
        >
          Built to do three things well.
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* 01 fast */}
        <PillarCard>
          <div className="mb-1.5 text-[11px] text-[#7A8190]" style={{ fontFamily: MONO }}>
            01 / FAST
          </div>
          <h3 className="mb-2 text-[21px]" style={{ fontFamily: HEADING, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Fast to launch
          </h3>
          <p className="mb-[18px] text-[14px] leading-[1.5] text-[#5A606C]">
            Paste a link, name it, ship it. A scannable code in under a minute.
          </p>
          <div className="rounded-[12px] border border-[#15181F]/[0.08] bg-white p-[13px]">
            <div className="mb-[7px] text-[11px] text-[#7A8190]" style={{ fontFamily: MONO }}>
              DESTINATION URL
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#15181F]/[0.08] bg-[#F6F4EF] px-[11px] py-[9px] text-[13px] text-[#15181F]">
              acme.com/spring
              <span className="ml-auto h-[14px] w-[6px] rounded-[1px] bg-[#0F7BFF]" />
            </div>
            <button
              type="button"
              className="mt-2.5 w-full rounded-lg bg-[#0F7BFF] py-2.5 text-[13px] font-semibold text-white"
              tabIndex={-1}
              aria-hidden="true"
            >
              Generate code
            </button>
          </div>
        </PillarCard>

        {/* 02 clean */}
        <PillarCard>
          <div className="mb-1.5 text-[11px] text-[#7A8190]" style={{ fontFamily: MONO }}>
            02 / CLEAN
          </div>
          <h3 className="mb-2 text-[21px]" style={{ fontFamily: HEADING, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Clean to share
          </h3>
          <p className="mb-[18px] text-[14px] leading-[1.5] text-[#5A606C]">
            Short, branded paths and codes that look intentional in the real world.
          </p>
          <div className="flex items-center gap-3.5 rounded-[12px] border border-[#15181F]/[0.08] bg-white p-4">
            <div className="shrink-0 rounded-md border border-[#15181F]/[0.06] p-1">
              <MiniQR px={62} color="#0F7BFF" seed="pillar" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#0F7BFF]" style={{ fontFamily: MONO }}>
                teag.me/menu
              </div>
              <div className="mt-1 text-[12px] leading-[1.4] text-[#7A8190]">
                Your logo, your colors, baked in.
              </div>
            </div>
          </div>
        </PillarCard>

        {/* 03 useful */}
        <PillarCard>
          <div className="mb-1.5 text-[11px] text-[#7A8190]" style={{ fontFamily: MONO }}>
            03 / USEFUL
          </div>
          <h3 className="mb-2 text-[21px]" style={{ fontFamily: HEADING, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Useful to track
          </h3>
          <p className="mb-[18px] text-[14px] leading-[1.5] text-[#5A606C]">
            Real analytics on the free plan — not a blurred preview behind a wall.
          </p>
          <div className="rounded-[12px] border border-[#15181F]/[0.08] bg-white p-[15px]">
            <div className="mb-2.5 flex justify-between">
              <span className="text-[10.5px] text-[#7A8190]" style={{ fontFamily: MONO }}>
                DEVICES
              </span>
              <span className="text-[10.5px] text-[#16A34A]" style={{ fontFamily: MONO }}>
                2,114 scans
              </span>
            </div>
            <DeviceBars />
          </div>
        </PillarCard>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- *
 * Product showcase — analytics dashboard mock
 * ----------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  delta,
  deltaColor,
}: {
  label: string;
  value: string;
  delta: string;
  deltaColor: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#15181F]/[0.08] p-4">
      <div className="text-[10px] text-[#7A8190]" style={{ fontFamily: MONO, letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div className="mt-[5px] text-[30px]" style={{ fontFamily: HEADING, fontWeight: 700, letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div className="mt-[3px] text-[12px] font-semibold" style={{ color: deltaColor }}>
        {delta}
      </div>
    </div>
  );
}

function ProductShowcase() {
  return (
    <section id="product" className="full-bleed pb-[30px] pt-16">
      <div className="overflow-hidden rounded-[24px] border border-[#15181F]/[0.09] bg-[#FFFDF8] shadow-[0_30px_80px_rgba(17,24,39,0.10)]">
        {/* topbar */}
        <div className="flex items-center justify-between border-b border-[#15181F]/[0.08] bg-[#F6F4EF]/60 px-6 py-[18px]">
          <div className="flex items-center gap-3">
            <span className="text-[16px]" style={{ fontFamily: HEADING, fontWeight: 700 }}>
              Spring Launch
            </span>
            <span
              className="rounded-md bg-[#0F7BFF]/[0.08] px-[9px] py-[3px] text-[11px] text-[#0F7BFF]"
              style={{ fontFamily: MONO }}
            >
              teag.me/launch
            </span>
          </div>
          <div className="flex gap-2">
            <span
              className="rounded-lg border border-[#15181F]/[0.12] px-[11px] py-1.5 text-[11.5px] text-[#5A606C]"
              style={{ fontFamily: MONO }}
            >
              Last 30 days ⌄
            </span>
            <span
              className="rounded-lg bg-[#15181F] px-[11px] py-1.5 text-[11.5px] text-white"
              style={{ fontFamily: MONO }}
            >
              Export ↓
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* stat row */}
          <div className="mb-[22px] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <StatCard label="TOTAL SCANS" value="24,901" delta="▲ 18.2%" deltaColor="#16A34A" />
            <StatCard label="UNIQUE" value="18,330" delta="▲ 12.0%" deltaColor="#16A34A" />
            <StatCard label="SCAN RATE" value="73.6%" delta="— flat" deltaColor="#7A8190" />
            <StatCard label="CODES LIVE" value="12" delta="+3 this week" deltaColor="#FF8A3D" />
          </div>

          {/* chart + devices */}
          <div className="grid gap-3.5 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-[16px] border border-[#15181F]/[0.08] p-[18px]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[15px]" style={{ fontFamily: HEADING, fontWeight: 700 }}>
                  Scans over time
                </span>
                <span className="text-[10.5px] text-[#7A8190]" style={{ fontFamily: MONO }}>
                  DAILY
                </span>
              </div>
              <DashboardLineChart />
            </div>
            <div className="rounded-[16px] border border-[#15181F]/[0.08] p-[18px]">
              <div className="mb-3.5 text-[15px]" style={{ fontFamily: HEADING, fontWeight: 700 }}>
                Devices
              </div>
              <div className="flex items-center gap-[18px]">
                <DevicesDonut px={96} />
                <div className="flex flex-col gap-[9px]">
                  <div className="flex items-center gap-[7px] text-[12.5px]">
                    <span className="h-[9px] w-[9px] rounded-[2px] bg-[#0F7BFF]" />
                    iOS <b style={{ fontFamily: HEADING }}>58%</b>
                  </div>
                  <div className="flex items-center gap-[7px] text-[12.5px]">
                    <span className="h-[9px] w-[9px] rounded-[2px] bg-[#15181F]" />
                    Android <b style={{ fontFamily: HEADING }}>34%</b>
                  </div>
                  <div className="flex items-center gap-[7px] text-[12.5px]">
                    <span className="h-[9px] w-[9px] rounded-[2px] bg-[#FF8A3D]" />
                    Desktop <b style={{ fontFamily: HEADING }}>8%</b>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* geography */}
          <div className="mt-3.5 rounded-[16px] border border-[#15181F]/[0.08] p-[18px]">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[15px]" style={{ fontFamily: HEADING, fontWeight: 700 }}>
                Geography
              </span>
              <span className="text-[10.5px] text-[#7A8190]" style={{ fontFamily: MONO }}>
                BY COUNTRY
              </span>
            </div>
            <div className="grid gap-[22px] md:grid-cols-2">
              <div className="flex flex-col gap-[11px]">
                <GeographyBars />
              </div>
              <div
                className="relative flex min-h-[150px] items-center justify-center rounded-[12px] border border-dashed border-[#15181F]/[0.16]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg,transparent,transparent 13px,rgba(21,24,31,0.035) 13px,rgba(21,24,31,0.035) 14px),repeating-linear-gradient(90deg,transparent,transparent 13px,rgba(21,24,31,0.035) 13px,rgba(21,24,31,0.035) 14px)",
                }}
              >
                <MapPins />
                <span
                  className="absolute bottom-2 left-2.5 text-[9.5px] text-[#9AA1AE]"
                  style={{ fontFamily: MONO }}
                >
                  SCAN_DENSITY_MAP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- *
 * How it works
 * ----------------------------------------------------------------------- */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Create",
      color: "rgba(15,123,255,0.25)",
      body: "Add your link, customize the path, drop in your logo and brand colors. Done in a minute.",
    },
    {
      n: "02",
      title: "Share",
      color: "rgba(15,123,255,0.25)",
      body: "Print it on packaging, posters, or menus. Share the short link anywhere a code won't fit.",
    },
    {
      n: "03",
      title: "Track",
      color: "rgba(255,138,61,0.4)",
      body: "Watch scans roll in by time, place, and device — and act on what's actually working.",
    },
  ];
  return (
    <section className="full-bleed pb-[30px] pt-[74px]">
      <div className="mb-[42px] text-center">
        <div
          className="mb-3.5 text-[11.5px] text-[#0F7BFF]"
          style={{ fontFamily: MONO, letterSpacing: "0.1em" }}
        >
          HOW IT WORKS
        </div>
        <h2 className="text-[40px]" style={{ fontFamily: HEADING, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Create → Share → Track
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className={`rounded-[18px] border ${HAIRLINE} bg-[#FFFDF8] p-[26px]`}>
            <div className="mb-3.5 flex items-center gap-[11px]">
              <span
                className="text-[34px]"
                style={{ fontFamily: HEADING, fontWeight: 800, letterSpacing: "-0.03em", color: s.color }}
              >
                {s.n}
              </span>
              <span className="text-[19px]" style={{ fontFamily: HEADING, fontWeight: 700 }}>
                {s.title}
              </span>
            </div>
            <p className="text-[14px] leading-[1.55] text-[#5A606C]">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- *
 * Pricing
 * ----------------------------------------------------------------------- */

function Check({ color }: { color: string }) {
  return (
    <span aria-hidden="true" style={{ color }}>
      ✓
    </span>
  );
}

function Pricing() {
  const freeFeatures = [
    "10 active dynamic QR codes",
    "Scan, geo & device analytics",
    "Short links on teag.me",
    "90 days of history",
  ];
  const proFeatures = [
    "Everything in Free, at scale",
    "Full brand kits & custom domains",
    "CSV & PDF exports, API access",
    "Unlimited history & team seats",
  ];
  return (
    <section id="pricing" className="full-bleed pb-[30px] pt-[74px]">
      <div className="mb-[42px] text-center">
        <div
          className="mb-3.5 text-[11.5px] text-[#0F7BFF]"
          style={{ fontFamily: MONO, letterSpacing: "0.1em" }}
        >
          PRICING
        </div>
        <h2 className="mb-2.5 text-[40px]" style={{ fontFamily: HEADING, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Generous free. Pro when you scale.
        </h2>
        <p className="text-[16px] text-[#5A606C]">Upgrade is a growth step, not a trapdoor.</p>
      </div>

      <div className="grid items-stretch gap-[18px] md:grid-cols-2">
        {/* Free */}
        <div className="rounded-[20px] border border-[#15181F]/[0.10] bg-[#FFFDF8] p-7">
          <div className="text-[11px] text-[#7A8190]" style={{ fontFamily: MONO, letterSpacing: "0.1em" }}>
            FREE
          </div>
          <div className="mb-1 mt-2.5 flex items-end gap-1.5">
            <span className="text-[44px]" style={{ fontFamily: HEADING, fontWeight: 800, letterSpacing: "-0.03em" }}>
              $0
            </span>
            <span className="mb-[9px] text-[14px] text-[#7A8190]">/ forever</span>
          </div>
          <p className="mb-5 text-[13.5px] text-[#5A606C]">Useful by default, not crippled.</p>
          <div className="flex flex-col gap-[11px] text-[14px] text-[#3C424E]">
            {freeFeatures.map((f) => (
              <div key={f} className="flex items-center gap-[9px]">
                <Check color="#0F7BFF" /> {f}
              </div>
            ))}
          </div>
          <Button
            asChild
            variant="outline"
            className="mt-6 h-auto w-full rounded-[11px] border-[#15181F]/[0.16] bg-[#FFFDF8] py-3.5 text-[15px] text-[#15181F]"
          >
            <Link href="/auth/login">Start free</Link>
          </Button>
        </div>

        {/* Pro */}
        <div className="relative rounded-[20px] bg-[#15181F] p-7 text-[#FFFDF8] shadow-[0_24px_60px_rgba(17,24,39,0.22)]">
          <div
            className="absolute right-[22px] top-[22px] rounded-md bg-[#FF8A3D]/[0.14] px-[9px] py-1 text-[10px] text-[#FF8A3D]"
            style={{ fontFamily: MONO, letterSpacing: "0.1em" }}
          >
            FOR SCALE
          </div>
          <div className="text-[11px] text-[#9AA1AE]" style={{ fontFamily: MONO, letterSpacing: "0.1em" }}>
            PRO
          </div>
          <div className="mb-1 mt-2.5 flex items-end gap-1.5">
            <span className="text-[44px]" style={{ fontFamily: HEADING, fontWeight: 800, letterSpacing: "-0.03em" }}>
              $2.99
            </span>
            <span className="mb-[9px] text-[14px] text-[#9AA1AE]">/ month</span>
          </div>
          <p className="mb-5 text-[13.5px] text-[#B7BDC8]">For volume, branding, and exports.</p>
          <div className="flex flex-col gap-[11px] text-[14px] text-[#E5E7EB]">
            {proFeatures.map((f) => (
              <div key={f} className="flex items-center gap-[9px]">
                <Check color="#FF8A3D" /> {f}
              </div>
            ))}
          </div>
          <Button
            asChild
            className="mt-6 h-auto w-full rounded-[11px] py-3.5 text-[15px]"
          >
            <Link href="/auth/login">Upgrade to Pro</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- *
 * Footer CTA
 * ----------------------------------------------------------------------- */

function FooterCta() {
  return (
    <section className="mt-[60px] bg-[#15181F] text-[#FFFDF8]">
      <div className="full-bleed pb-10 pt-[84px] text-center">
        <h2
          className="mx-auto mb-4 text-[40px] text-[#FFFDF8] sm:text-[54px]"
          style={{ fontFamily: HEADING, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1 }}
        >
          Tag it. Share it. Track it.
        </h2>
        <p className="mb-[30px] text-[18px] text-[#B7BDC8]">Free QR tracking, live in a minute.</p>

        <div className="mb-[60px] flex flex-wrap justify-center gap-[13px]">
          <Button
            asChild
            className="h-auto rounded-[12px] px-[30px] py-[15px] text-[15.5px] shadow-[0_10px_30px_rgba(15,123,255,0.4)]"
          >
            <Link href="/auth/login">Create a code</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto rounded-[12px] border-white/[0.22] bg-transparent px-[26px] py-[15px] text-[15.5px] text-[#FFFDF8] hover:bg-white/5 hover:text-[#FFFDF8]"
          >
            <Link href="/dashboard">See a live demo →</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[18px] border-t border-white/10 pt-7 text-left">
          <Link href="/" className="flex items-center gap-2.5">
            <TeagMark
              tileClassName="h-[26px] w-[26px] rounded-[9px]"
              className="h-[15px] w-[15px]"
            />
            <span className="text-[17px]" style={{ fontFamily: HEADING, fontWeight: 700 }}>
              teag.me
            </span>
          </Link>
          <div className="flex gap-[26px] text-[13.5px] text-[#9AA1AE]">
            <Link href="/scanner" className="hover:text-[#FFFDF8]">
              Scanner app
            </Link>
            <Link href="#pricing" className="hover:text-[#FFFDF8]">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-[#FFFDF8]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#FFFDF8]">
              Terms
            </Link>
          </div>
          <div className="text-[11px] text-[#6B7280]" style={{ fontFamily: MONO }}>
            © 2026 teag.me
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- *
 * Page
 * ----------------------------------------------------------------------- */

export function LandingPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F6F4EF] text-[#15181F]">
      <Nav />
      <Hero />
      <TrustStrip />
      <Pillars />
      <ProductShowcase />
      <HowItWorks />
      <Pricing />
      <FooterCta />
    </div>
  );
}
