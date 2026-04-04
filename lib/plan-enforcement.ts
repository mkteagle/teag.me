import { and, count, eq, gte } from "drizzle-orm";
import { getDb } from "./db";
import { qrCodes, scans, subscriptions, users } from "./db/schema";
import { type PlanId, getPlanLimits } from "./plans";

export interface UserPlan {
  plan: PlanId;
  limits: ReturnType<typeof getPlanLimits>;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
}

export interface UsageCheck {
  allowed: boolean;
  current: number;
  limit: number;
  plan: PlanId;
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const [[user], [sub]] = await Promise.all([
    getDb().select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1),
    getDb().select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1),
  ]);

  // Admins always get Pro — not tied to billing
  const isAdmin = user?.role === "ADMIN";
  const plan: PlanId =
    isAdmin || (sub?.plan === "PRO" && sub.status === "active") ? "PRO" : "FREE";

  return {
    plan,
    limits: getPlanLimits(plan),
    stripeCustomerId: sub?.stripeCustomerId ?? null,
    stripeSubscriptionId: sub?.stripeSubscriptionId ?? null,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
  };
}

export async function checkQrCodeLimit(
  userId: string
): Promise<UsageCheck> {
  const userPlan = await getUserPlan(userId);

  const [{ activeCount }] = await getDb()
    .select({ activeCount: count() })
    .from(qrCodes)
    .where(
      and(eq(qrCodes.userId, userId), eq(qrCodes.archived, false))
    );

  return {
    allowed: Number(activeCount) < userPlan.limits.maxActiveQrCodes,
    current: Number(activeCount),
    limit: userPlan.limits.maxActiveQrCodes,
    plan: userPlan.plan,
  };
}

export async function checkScanLimit(
  userId: string
): Promise<UsageCheck> {
  const userPlan = await getUserPlan(userId);

  // Count scans this billing period (current calendar month)
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all QR code IDs for this user
  const userQrCodes = await getDb()
    .select({ id: qrCodes.id })
    .from(qrCodes)
    .where(eq(qrCodes.userId, userId));

  if (userQrCodes.length === 0) {
    return {
      allowed: true,
      current: 0,
      limit: userPlan.limits.maxScansPerMonth,
      plan: userPlan.plan,
    };
  }

  const qrCodeIds = userQrCodes.map((q) => q.id);

  const { sql } = await import("drizzle-orm");
  const [{ scanCount }] = await getDb()
    .select({ scanCount: count() })
    .from(scans)
    .where(
      and(
        sql`${scans.qrCodeId} IN (${sql.join(
          qrCodeIds.map((id) => sql`${id}`),
          sql`, `
        )})`,
        gte(scans.timestamp, periodStart)
      )
    );

  return {
    allowed: Number(scanCount) < userPlan.limits.maxScansPerMonth,
    current: Number(scanCount),
    limit: userPlan.limits.maxScansPerMonth,
    plan: userPlan.plan,
  };
}

export async function checkFeatureAccess(
  userId: string,
  feature: "logoUpload" | "customDomains" | "csvExport" | "bulkActions"
): Promise<{ allowed: boolean; plan: PlanId }> {
  const userPlan = await getUserPlan(userId);
  return {
    allowed: userPlan.limits[feature],
    plan: userPlan.plan,
  };
}

export function getAnalyticsRetentionDate(plan: PlanId): Date | null {
  const limits = getPlanLimits(plan);
  if (limits.analyticsRetentionDays === -1) return null; // unlimited
  const date = new Date();
  date.setDate(date.getDate() - limits.analyticsRetentionDays);
  return date;
}
