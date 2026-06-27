import { NextResponse } from "next/server";
import { getStripe, getProPriceId } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth-session";
import { getUserPlan } from "@/lib/plan-enforcement";
import { getDb } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPlan = await getUserPlan(user.id);

    if (userPlan.plan === "PRO") {
      return NextResponse.json(
        { error: "Already on Pro plan" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://teag.me";

    // Reuse existing Stripe customer or create one
    let customerId = userPlan.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      // Upsert subscription record with customer ID
      const [existing] = await getDb()
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, user.id))
        .limit(1);

      if (existing) {
        await getDb()
          .update(subscriptions)
          .set({ stripeCustomerId: customerId, updatedAt: new Date() })
          .where(eq(subscriptions.userId, user.id));
      } else {
        await getDb().insert(subscriptions).values({
          id: crypto.randomUUID(),
          userId: user.id,
          stripeCustomerId: customerId,
          plan: "FREE",
          status: "active",
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: getProPriceId(), quantity: 1 }],
      success_url: `${baseUrl}/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/upgrade`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
