"use client";

import { useState, useEffect } from "react";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const freeFeatures = [
  "10 active dynamic QR codes",
  "Unlimited static QR generation",
  "3,000 tracked scans per month",
  "90-day analytics retention",
  "Basic scan, country, and device insights",
];

const proFeatures = [
  "100 active dynamic QR codes",
  "50,000 tracked scans per month",
  "Unlimited retention and CSV exports",
  "Logo uploads and saved brand styles",
  "Custom domains, bulk actions, and richer analytics",
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [usage, setUsage] = useState<{
    activeQrCodes: { current: number; limit: number };
    scansThisMonth: { current: number; limit: number };
  } | null>(null);

  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then((data) => {
        setPlan(data.plan);
        setUsage(data.usage);
      })
      .catch(console.error);
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {plan === "PRO" ? "Manage your plan" : "Upgrade to Pro"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {plan === "PRO"
            ? "You're on the Pro plan. Manage your subscription below."
            : "Unlock higher limits, logo uploads, CSV exports, and more."}
        </p>
      </div>

      {usage && (
        <div className="grid gap-4 sm:grid-cols-2">
          <UsageMeter
            label="Active QR codes"
            current={usage.activeQrCodes.current}
            limit={usage.activeQrCodes.limit}
          />
          <UsageMeter
            label="Scans this month"
            current={usage.scansThisMonth.current}
            limit={usage.scansThisMonth.limit}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-8">
          <h3 className="text-xl font-semibold">Free</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Where you are now
          </p>
          <div className="mt-2 text-3xl font-semibold">$0</div>
          <ul className="mt-6 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-primary/30 bg-card p-8 ring-1 ring-primary/10">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">Pro</h3>
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            For serious campaigns
          </p>
          <div className="mt-2">
            <span className="text-3xl font-semibold">$9</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="mt-6 space-y-3">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {plan === "PRO" ? (
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleManage}
                disabled={loading}
              >
                {loading ? "Loading..." : "Manage subscription"}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? "Redirecting to checkout..." : "Upgrade to Pro"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageMeter({
  label,
  current,
  limit,
}: {
  label: string;
  current: number;
  limit: number;
}) {
  const pct = Math.min((current / limit) * 100, 100);
  const isAtLimit = current >= limit;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={isAtLimit ? "font-medium text-destructive" : ""}>
          {current.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-secondary">
        <div
          className={`h-2 rounded-full transition-all ${
            isAtLimit ? "bg-destructive" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
