import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(
            session.subscription as string
          );
          await upsertSubscription(session.metadata?.userId, sub);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const [existing] = await getDb()
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1);

        if (existing) {
          await updateSubscriptionFromStripe(existing.userId, sub);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await getDb()
          .update(subscriptions)
          .set({
            plan: "FREE",
            status: "canceled",
            stripeSubscriptionId: null,
            stripePriceId: null,
            currentPeriodEnd: null,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, customerId));
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        if (customerId) {
          await getDb()
            .update(subscriptions)
            .set({ status: "past_due", updatedAt: new Date() })
            .where(eq(subscriptions.stripeCustomerId, customerId));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

function extractPeriod(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return {
    start: item?.current_period_start
      ? new Date(item.current_period_start * 1000)
      : null,
    end: item?.current_period_end
      ? new Date(item.current_period_end * 1000)
      : null,
  };
}

async function upsertSubscription(
  userId: string | undefined,
  sub: Stripe.Subscription
) {
  if (!userId) return;

  const plan = sub.status === "active" ? "PRO" : "FREE";
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const period = extractPeriod(sub);

  const [existing] = await getDb()
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const values = {
    plan: plan as "FREE" | "PRO",
    status: sub.status,
    stripeSubscriptionId: sub.id,
    stripePriceId: priceId,
    currentPeriodStart: period.start,
    currentPeriodEnd: period.end,
    updatedAt: new Date(),
  };

  if (existing) {
    await getDb()
      .update(subscriptions)
      .set(values)
      .where(eq(subscriptions.userId, userId));
  } else {
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    await getDb().insert(subscriptions).values({
      id: crypto.randomUUID(),
      userId,
      stripeCustomerId: customerId,
      ...values,
    });
  }
}

async function updateSubscriptionFromStripe(
  userId: string,
  sub: Stripe.Subscription
) {
  const plan = sub.status === "active" ? "PRO" : "FREE";
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const period = extractPeriod(sub);

  await getDb()
    .update(subscriptions)
    .set({
      plan: plan as "FREE" | "PRO",
      status: sub.status,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, userId));
}
