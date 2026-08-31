import { NextResponse } from "next/server";
import { getProPriceId, getStripe } from "@/lib/stripe";

export async function GET() {
  try {
    const price = await getStripe().prices.retrieve(getProPriceId());

    return NextResponse.json({
      active: price.active,
      currency: price.currency,
      unitAmount: price.unit_amount,
      interval: price.recurring?.interval ?? null,
      intervalCount: price.recurring?.interval_count ?? null,
    });
  } catch (error) {
    console.error("Stripe price lookup error:", error);
    return NextResponse.json(
      { error: "Failed to load Pro pricing" },
      { status: 500 }
    );
  }
}
