"use client";

import { useState, useEffect } from "react";

export interface PlanData {
  plan: "FREE" | "PRO";
  usage: {
    activeQrCodes: { current: number; limit: number };
    scansThisMonth: { current: number; limit: number };
  };
  hasStripeCustomer: boolean;
  currentPeriodEnd: string | null;
}

function isPlanData(value: unknown): value is PlanData {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PlanData>;
  return (
    (candidate.plan === "FREE" || candidate.plan === "PRO") &&
    typeof candidate.usage?.activeQrCodes?.current === "number" &&
    typeof candidate.usage.activeQrCodes.limit === "number" &&
    typeof candidate.usage?.scansThisMonth?.current === "number" &&
    typeof candidate.usage.scansThisMonth.limit === "number"
  );
}

export function usePlan() {
  const [data, setData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plan")
      .then(async (response) => {
        const body: unknown = await response.json();
        if (!response.ok || !isPlanData(body)) {
          throw new Error("Unable to load plan details.");
        }
        return body;
      })
      .then((planData) => setData(planData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const atQrLimit =
    data != null &&
    data.plan === "FREE" &&
    data.usage.activeQrCodes.current >= data.usage.activeQrCodes.limit;

  const atScanLimit =
    data != null &&
    data.plan === "FREE" &&
    data.usage.scansThisMonth.current >= data.usage.scansThisMonth.limit;

  return { data, loading, atQrLimit, atScanLimit };
}
