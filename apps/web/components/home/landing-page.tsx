import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import { toDataURL } from "qrcode";
import { TeagMark, TeagWordmark } from "@/components/brand/teag-mark";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/plans";
import { ExampleScanTrend } from "./marketing-visuals";

const createHref = "/auth/login?callbackURL=/generate";
const workspaceNavLink = "inline-flex min-h-11 items-center text-sm font-semibold text-muted-foreground hover:text-foreground sm:min-h-24 sm:text-base";

const exampleCodes = [
  { name: "Studio menu", path: "menu", trend: [49, 60, 73, 95, 143, 170, 204, 271, 316, 380, 460, 531, 680, 1550] },
  { name: "Spring launch", path: "launch", trend: [30, 46, 81, 130, 141, 185, 246, 201, 276, 293, 343, 401, 471, 573] },
  { name: "Event poster", path: "event", trend: [56, 66, 101, 136, 164, 198, 227, 255, 310, 351, 389, 471, 621, 1096] },
];

const benefits = [
  ["Create", "Paste a destination and get a QR code and a short teag.me link."],
  ["Share", "Save the code for a menu, poster, or package, or send the short link directly."],
  ["Track", "See scans by time, location, and device. Update the destination without reprinting the code."],
];

const plans = [
  { name: "Free", price: "$0", interval: "forever", features: ["10 active dynamic QR codes", "1 link page", `${PLAN_LIMITS.FREE.maxScansPerMonth.toLocaleString("en-US")} tracked scans per month`, `${PLAN_LIMITS.FREE.analyticsRetentionDays} days of analytics history`], action: "Start free", link: createHref, tracking: "start_free" },
  { name: "Pro", price: "$2.99", interval: "per month", features: ["Unlimited active dynamic QR codes", "Unlimited link pages", "50,000 tracked scans per month", "Logo uploads and unlimited analytics history"], action: "View Pro", link: "/auth/login?callbackURL=/upgrade", tracking: "upgrade_pro" },
];

async function ExampleWorkspace() {
  const codes = await Promise.all(exampleCodes.map(async (code) => {
    const url = `https://example.com/${code.path}`;
    return {
      ...code,
      url,
      scans: code.trend.reduce((total, count) => total + count, 0),
      qr: await toDataURL(url, { width: 128, margin: 4 }),
    };
  }));
  const total = codes.reduce((sum, code) => sum + code.scans, 0);

  return (
    <figure aria-labelledby="example-workspace-caption" className="min-w-0 rounded-2xl border bg-card">
      <figcaption className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-5 sm:px-6 sm:py-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-[-0.055em] sm:text-[1.875rem]">Your codes</h2>
          <p className="mt-1 text-sm text-muted-foreground">{codes.length} codes · {total.toLocaleString("en-US")} scans</p>
        </div>
        <p id="example-workspace-caption" className="rounded-full bg-[#fff1c4] px-3 py-1.5 text-xs font-semibold text-foreground">Example workspace</p>
      </figcaption>

      <div className="px-4 sm:px-6">
        <table className="w-full table-fixed text-left" aria-label="Example QR codes and scan counts">
          <thead>
            <tr className="border-b text-xs sm:text-sm">
              <th scope="col" className="w-14 py-3 pr-2 font-semibold text-muted-foreground sm:w-20">Code</th>
              <th scope="col" className="py-3 pr-2 font-semibold text-muted-foreground">Destination</th>
              <th scope="col" className="w-[3.75rem] py-3 font-semibold text-muted-foreground sm:w-[4.25rem]">Scans</th>
              <th scope="col" className="hidden w-[24%] py-3 sm:table-cell"><span className="sr-only">14-day scan trend</span></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr key={code.path} className="border-b last:border-0">
                <td className="py-3 pr-2">
                  <Image src={code.qr} alt="" width={64} height={64} unoptimized className="size-11 rounded-lg border bg-white sm:size-[58px]" />
                </td>
                <td className="py-3 pr-2">
                  <span className="block truncate text-sm font-bold tracking-tight sm:text-base">{code.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground sm:text-sm">{code.url.replace("https://", "")}</span>
                </td>
                <td className="py-3 font-bold tabular-nums sm:text-lg">{code.scans.toLocaleString("en-US")}</td>
                <td className="hidden py-3 sm:table-cell"><ExampleScanTrend values={code.trend} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function LandingPage() {
  return (
    <>
      <header className="border-b bg-background">
        <div className="full-bleed grid grid-cols-[1fr_auto] items-center gap-x-3 sm:flex sm:gap-9 lg:gap-14">
          <TeagWordmark href="/" />
          <nav className="order-last col-span-2 flex gap-5 sm:order-none sm:gap-7" aria-label="Site">
            <Link href="/scanner" className={workspaceNavLink}>Scanner</Link>
            <Link href="/docs" className={workspaceNavLink}>Docs</Link>
            <Link href="#pricing" className={workspaceNavLink}>Pricing</Link>
          </nav>
          <Button variant="outline" asChild className="justify-self-end sm:ml-auto">
            <Link href="/auth/login" data-marketing-cta="sign_in_header">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="full-bleed">
        <section className="grid items-center gap-9 py-10 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:py-20">
          <div className="min-w-0">
            <h1 className="text-[clamp(2.65rem,5.6vw,5.5rem)] font-extrabold leading-[1.01] tracking-[-0.06em]">
              QR codes <span className="block">you can track</span>
            </h1>
            <p className="mt-5 max-w-[39ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              Create a QR code, share it anywhere, and see what gets scanned. Basic analytics are free.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button size="lg" asChild className="font-semibold sm:h-14 sm:min-w-48 sm:text-base">
                <Link href={createHref} data-marketing-cta="create_hero"><Plus className="size-5" aria-hidden="true" /> Create QR</Link>
              </Button>
              <Link href="/scanner" data-marketing-cta="scanner_hero" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent hover:underline">
                iPhone scanner <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <ExampleWorkspace />
        </section>

        <section className="grid gap-6 border-y py-8 sm:grid-cols-3 sm:gap-8 sm:py-11" aria-label="How it works">
          {benefits.map(([title, detail]) => (
            <div key={title}>
              <h2 className="text-xl font-bold tracking-tight">{title}</h2>
              <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">{detail}</p>
            </div>
          ))}
        </section>

        <section id="pricing" className="scroll-mt-6 py-12 sm:py-16">
          <h2 className="mb-6 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-2xl border bg-card p-6 sm:p-8">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="my-3 text-3xl font-extrabold">{plan.price} <span className="text-sm font-medium text-muted-foreground">{plan.interval}</span></p>
                <ul className="my-5 space-y-2 text-sm">
                  {plan.features.map((feature) => <li key={feature} className="flex items-center gap-2"><Check className="size-4 shrink-0 text-accent" aria-hidden="true" /> {feature}</li>)}
                </ul>
                <Button variant={plan.name === "Free" ? "default" : "outline"} asChild><Link href={plan.link} data-marketing-cta={plan.tracking}>{plan.action}</Link></Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="full-bleed flex flex-wrap items-center justify-between gap-4 py-6 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground"><TeagMark tileClassName="h-6 w-5" />teag.me</Link>
          <nav className="flex flex-wrap gap-4" aria-label="Footer"><Link href="/scanner">Scanner</Link><Link href="/docs">Docs</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav>
        </div>
      </footer>
    </>
  );
}
