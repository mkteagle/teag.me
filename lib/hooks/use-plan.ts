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

export function usePlan() {
  const [data, setData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then(setData)
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
