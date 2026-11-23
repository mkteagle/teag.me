import { and, count, eq, gte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { monthlyScanUsage, qrCodes, scans, subscriptions, users } from "./db/schema";
import { type PlanId, getPlanLimits } from "./plans";
import { canUseAppStoreEnvironment } from "./app-store-environment";

export interface UserPlan {
  plan: PlanId;
  limits: ReturnType<typeof getPlanLimits>;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  billingSource: "stripe" | "app_store" | null;
}

export interface UsageCheck {
  allowed: boolean;
  current: number;
  limit: number;
  plan: PlanId;
}

export async function getUserPlan(userId: string, database: Pick<ReturnType<typeof getDb>, "select"> = getDb()): Promise<UserPlan> {
  const [[user], [sub]] = await Promise.all([
    database.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1),
    database.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1),
  ]);

  // Admins always get Pro — not tied to billing
  const isAdmin = user?.role === "ADMIN";
  const stripeActive = Boolean(
    sub?.stripeSubscriptionId && sub.plan === "PRO" && sub.status === "active"
  );
  const appStoreActive = Boolean(
    sub?.appStoreProductId && canUseAppStoreEnvironment(userId, sub.appStoreEnvironment) &&
      (sub.appStoreStatus === "active" || sub.appStoreStatus === "grace_period") &&
      sub.appStoreExpiresAt &&
      sub.appStoreExpiresAt.getTime() > Date.now()
  );
  const plan: PlanId = isAdmin || stripeActive || appStoreActive ? "PRO" : "FREE";

  return {
    plan,
    limits: getPlanLimits(plan),
    stripeCustomerId: sub?.stripeCustomerId ?? null,
    stripeSubscriptionId: sub?.stripeSubscriptionId ?? null,
    currentPeriodEnd: appStoreActive ? sub?.appStoreExpiresAt ?? null : sub?.currentPeriodEnd ?? null,
    billingSource: appStoreActive ? "app_store" : stripeActive ? "stripe" : null,
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
    allowed:
      userPlan.limits.maxActiveQrCodes === -1 ||
      Number(activeCount) < userPlan.limits.maxActiveQrCodes,
    current: Number(activeCount),
    limit: userPlan.limits.maxActiveQrCodes,
    plan: userPlan.plan,
  };
}

export async function checkScanLimit(
  userId: string
): Promise<UsageCheck> {
  const userPlan = await getUserPlan(userId);
  const current = await getMonthlyScanUsage(getDb(), userId, getScanMonthStart(new Date()));
  const limit = userPlan.limits.maxScansPerMonth;

  return {
    allowed: current < limit,
    current,
    limit,
    plan: userPlan.plan,
  };
}

function getScanMonthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

async function getMonthlyScanUsage(
  database: Pick<ReturnType<typeof getDb>, "select">,
  userId: string,
  monthStart: Date
) {
  const storedUsage = database
    .select({ count: monthlyScanUsage.scanCount })
    .from(monthlyScanUsage)
    .where(and(eq(monthlyScanUsage.userId, userId), eq(monthlyScanUsage.monthStart, monthStart)));
  // Existing months have scan rows before their first usage counter is written.
  const existingScans = database
    .select({ count: count() })
    .from(scans)
    .innerJoin(qrCodes, eq(scans.qrCodeId, qrCodes.id))
    .where(and(eq(qrCodes.userId, userId), gte(scans.timestamp, monthStart)));
  const [usage] = await database
    .select({ count: sql<number>`coalesce((${storedUsage}), (${existingScans}))`.mapWith(Number) })
    .from(users)
    .where(eq(users.id, userId));

  return usage?.count ?? 0;
}

async function lockScanUsage(database: Pick<ReturnType<typeof getDb>, "execute">, userId: string) {
  // Scan creation and code deletion share the per-owner lock.
  await database.execute(sql`select pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
}

type ScanTransaction = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

export async function trackScanWithinQuota(
  userId: string,
  insert: (transaction: ScanTransaction, timestamp: Date) => Promise<boolean>,
) {
  const { limits } = await getUserPlan(userId);

  await getDb().transaction(async (transaction) => {
    await lockScanUsage(transaction, userId);
    const timestamp = new Date();
    const monthStart = getScanMonthStart(timestamp);
    const current = await getMonthlyScanUsage(transaction, userId, monthStart);
    if (current >= limits.maxScansPerMonth || !await insert(transaction, timestamp)) return;

    await transaction.insert(monthlyScanUsage).values({ userId, monthStart, scanCount: current + 1 })
      .onConflictDoUpdate({
        target: [monthlyScanUsage.userId, monthlyScanUsage.monthStart],
        set: { scanCount: current + 1 },
      });
  });
}

export async function createTrackedScan(
  userId: string,
  values: Omit<typeof scans.$inferInsert, "timestamp">
) {
  await trackScanWithinQuota(userId, async (transaction, timestamp) => {
    const [inserted] = await transaction.insert(scans).values({ ...values, timestamp })
      .onConflictDoNothing({ target: scans.id })
      .returning({ id: scans.id });
    return Boolean(inserted);
  });
}

export async function deleteTrackedQrCode(id: string, userId: string) {
  await getDb().transaction(async (transaction) => {
    await lockScanUsage(transaction, userId);
    const monthStart = getScanMonthStart(new Date());
    const scanCount = await getMonthlyScanUsage(transaction, userId, monthStart);
    const [deleted] = await transaction.delete(qrCodes)
      .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, userId)))
      .returning({ id: qrCodes.id });

    // Preserve the current month's quota after the scan rows cascade away.
    if (deleted && scanCount > 0) {
      await transaction.insert(monthlyScanUsage).values({ userId, monthStart, scanCount })
        .onConflictDoNothing();
    }
  });
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
  date.setUTCDate(date.getUTCDate() - limits.analyticsRetentionDays);
  return date;
}
