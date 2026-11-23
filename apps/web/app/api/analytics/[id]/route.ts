import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsForQrCode } from "@/lib/db/queries";
import { getCurrentUser } from "@/lib/auth-session";
import { getUserPlan, getAnalyticsRetentionDate } from "@/lib/plan-enforcement";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPlan = await getUserPlan(user.id);
    const retentionDate = getAnalyticsRetentionDate(userPlan.plan);
    const analytics = await getAnalyticsForQrCode(id, user.id, retentionDate);
    if (!analytics) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...analytics,
      plan: userPlan.plan,
      retentionDays: userPlan.limits.analyticsRetentionDays,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
