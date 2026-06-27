import Link from "next/link";
import { ArrowRight, BarChart3, Check, Globe2, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeagMark } from "@/components/brand/teag-mark";

const proofPoints = [
  "10 active dynamic QR codes on Free",
  "3,000 tracked scans per month included",
  "Upgrade only when you need scale, branding, or exports",
];

const workflow = [
  {
    title: "Create",
    body:
      "Generate QR codes and short links that look clean, load fast, and are ready for campaigns, events, menus, and product packaging.",
    icon: QrCode,
  },
  {
    title: "Share",
    body:
      "Put your code on signage, stickers, cards, packaging, and social posts without turning your link into a branding nightmare.",
    icon: Sparkles,
  },
  {
    title: "Track",
    body:
      "See scans, timing, geography, and device patterns in one place so you know whether the real-world link is actually working.",
    icon: BarChart3,
  },
];

const planFeatures = {
  free: [
    "10 active dynamic QR codes",
    "Unlimited static QR generation",
    "3,000 tracked scans per month",
    "90-day analytics retention",
    "Basic scan, country, and device insights",
  ],
  pro: [
    "100 active dynamic QR codes",
    "50,000 tracked scans per month",
    "Unlimited retention and CSV exports",
    "Logo uploads and saved brand styles",
    "Custom domains, bulk actions, and richer analytics",
  ],
};

export function LandingPage() {
  return (
    <div className="page-shell relative min-h-screen w-full overflow-x-hidden">
      <div
        className="hero-orb left-[-4rem] top-[-2rem] h-40 w-40 bg-primary/40 md:h-72 md:w-72"
        aria-hidden="true"
      />
      <div
        className="hero-orb right-[-3rem] top-20 h-36 w-36 bg-accent/40 md:h-64 md:w-64"
        aria-hidden="true"
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-8 md:px-10 lg:px-12">
        <header className="mb-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <TeagMark />
            <div>
              <div className="text-lg font-semibold tracking-tight">teag.me</div>
              <div className="text-sm text-muted-foreground">
                QR codes, short links, and scan analytics
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild className="text-sm">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">Start free</Link>
            </Button>
          </div>
        </header>

        <section className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-2xl">
            <div className="mono-badge mb-5">Generous free tier. Simple upgrade path.</div>
            <h1 className="max-w-3xl text-5xl leading-[0.96] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
              Free QR tracking
              <br />
              without the paywall.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Generate QR codes, shorten links, and actually see scan results without
              getting pushed into a paid plan the moment you want useful data.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/auth/login">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard">See the product</Link>
              </Button>
            </div>

            <ul className="mt-8 space-y-3">
              {proofPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-sm text-muted-foreground sm:text-base"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="data-card overflow-hidden rounded-[28px] border border-foreground/5 bg-white/85 backdrop-blur">
              <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                <div>
                  <div className="text-sm font-medium text-foreground">Campaign overview</div>
                  <div className="text-sm text-muted-foreground">
                    QR and short-link performance in one place
                  </div>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Live tracking
                </div>
              </div>

              <div className="grid gap-4 p-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="text-sm text-muted-foreground">Scans</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight">2,481</div>
                    <div className="mt-1 text-sm text-primary">+18% this week</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="text-sm text-muted-foreground">Countries</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight">18</div>
                    <div className="mt-1 text-sm text-muted-foreground">Top: US, CA, UK</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="text-sm text-muted-foreground">Best QR</div>
                    <div className="mt-2 text-lg font-semibold tracking-tight">teag.me/menu</div>
                    <div className="mt-1 text-sm text-muted-foreground">742 scans</div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[24px] border border-border/70 bg-[#0f172a] p-5 text-white">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/70">Scan activity</div>
                        <div className="mt-1 text-xl font-semibold tracking-tight">
                          Last 7 days
                        </div>
                      </div>
                      <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                        Updated 6m ago
                      </div>
                    </div>
                    <div className="flex h-44 items-end gap-3">
                      {[44, 62, 71, 58, 82, 96, 88].map((value, index) => (
                        <div key={index} className="flex flex-1 flex-col items-center gap-3">
                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-primary to-[#6bb3ff]"
                            style={{ height: `${value}%` }}
                          />
                          <span className="text-xs text-white/60">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Traffic mix</div>
                        <div className="mt-1 text-xl font-semibold tracking-tight">
                          Scan sources
                        </div>
                      </div>
                      <Globe2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="mt-6 space-y-4">
                      {[
                        ["Direct scan", "51%"],
                        ["Printed flyers", "24%"],
                        ["Packaging", "16%"],
                        ["Social profile", "9%"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-foreground">{label}</span>
                            <span className="font-medium text-muted-foreground">{value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                              style={{ width: value }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-md">
            <div className="mono-badge mb-4">Why it works</div>
            <h2 className="text-3xl tracking-tight sm:text-4xl">
              QR creation, short links, and scan analytics built into one clean flow.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              The product story is simple: create a QR code, share it anywhere, and
              finally get useful feedback from the real world without paying just to
              unlock the basics.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {workflow.map((item) => (
              <div key={item.title} className="data-card rounded-[24px] p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-2xl tracking-tight">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <div className="mb-8 max-w-2xl">
            <div className="mono-badge mb-4">Free vs Pro</div>
            <h2 className="text-3xl tracking-tight sm:text-4xl">
              Keep the free plan useful. Charge for scale, branding, and depth.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="data-card rounded-[28px] p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl tracking-tight">Free</h3>
                  <p className="mt-2 text-muted-foreground">
                    Enough to launch and measure real campaigns.
                  </p>
                </div>
                <div className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground">
                  $0
                </div>
              </div>
              <ul className="mt-8 space-y-4">
                {planFeatures.free.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm sm:text-base">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="data-card rounded-[28px] border-primary/20 bg-white p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mono-badge mb-3">Recommended</div>
                  <h3 className="text-2xl tracking-tight">Pro</h3>
                  <p className="mt-2 text-muted-foreground">
                    For serious campaigns, branded experiences, and deeper reporting.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold tracking-tight">$9</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>
              <ul className="mt-8 space-y-4">
                {planFeatures.pro.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm sm:text-base">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-24">
          <div className="data-card rounded-[32px] bg-foreground px-8 py-10 text-background md:px-12 md:py-14">
            <div className="max-w-2xl">
              <div className="mono-badge border-white/10 bg-white/10 text-white">Start here</div>
              <h2 className="mt-5 text-3xl tracking-tight text-white sm:text-5xl">
                Start tracking for free. Upgrade only when the volume justifies it.
              </h2>
              <p className="mt-4 text-lg leading-8 text-white/72">
                `teag.me` should feel generous before it feels monetized. That is the
                whole point.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90">
                <Link href="/auth/login">Create your first QR code</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/privacy">Privacy</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
