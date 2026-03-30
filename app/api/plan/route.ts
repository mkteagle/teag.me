import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { getUserPlan, checkQrCodeLimit, checkScanLimit } from "@/lib/plan-enforcement";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [userPlan, qrUsage, scanUsage] = await Promise.all([
      getUserPlan(user.id),
      checkQrCodeLimit(user.id),
      checkScanLimit(user.id),
    ]);

    return NextResponse.json({
      plan: userPlan.plan,
      limits: userPlan.limits,
      usage: {
        activeQrCodes: { current: qrUsage.current, limit: qrUsage.limit },
        scansThisMonth: { current: scanUsage.current, limit: scanUsage.limit },
      },
      hasStripeCustomer: !!userPlan.stripeCustomerId,
      currentPeriodEnd: userPlan.currentPeriodEnd,
    });
  } catch (error) {
    console.error("Plan check error:", error);
    return NextResponse.json({ error: "Failed to check plan" }, { status: 500 });
  }
}
