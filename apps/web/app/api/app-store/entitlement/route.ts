import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth-session";
import {
  APP_STORE_PRODUCT_ID,
  applyVerifiedTransaction,
  getOrCreateAppStoreAccountToken,
  verifyAppStoreTransaction,
} from "@/lib/app-store";
import { getUserPlan } from "@/lib/plan-enforcement";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireApiUser();
    const [appAccountToken, userPlan] = await Promise.all([
      getOrCreateAppStoreAccountToken(user.id),
      getUserPlan(user.id),
    ]);
    return NextResponse.json({ appAccountToken, productId: APP_STORE_PRODUCT_ID, plan: userPlan.plan });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to load App Store entitlement", error);
    return NextResponse.json({ error: "Failed to load entitlement" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json() as { signedTransaction?: unknown };
    if (typeof body.signedTransaction !== "string" || body.signedTransaction.length > 100_000) {
      return NextResponse.json({ error: "A signed transaction is required" }, { status: 400 });
    }
    const transaction = await verifyAppStoreTransaction(body.signedTransaction);
    const entitlement = await applyVerifiedTransaction(user.id, transaction);
    return NextResponse.json(entitlement);
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Invalid App Store transaction";
    console.error("Failed to verify App Store transaction", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
