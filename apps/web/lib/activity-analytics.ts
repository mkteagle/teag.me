import { and, count, desc, eq, gte, lte, ne, sql, type AnyColumn } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { linkPageEvents, linkPages, qrCodes, scans } from "@/lib/db/schema";

export type ActivityFilter = "all" | "codes" | "link-pages";

export type ActivityCounts = {
  codeScans: number;
  codeOpens: number;
  pageViews: number;
  pageScans: number;
  pageClicks: number;
};

const emptyCounts: ActivityCounts = { codeScans: 0, codeOpens: 0, pageViews: 0, pageScans: 0, pageClicks: 0 };
const pageMetrics = { view: "pageViews", scan: "pageScans", click: "pageClicks" } as const;
const dayMs = 86_400_000;
const utcDay = (value: AnyColumn) => sql<string>`to_char(${value} at time zone 'UTC', 'YYYY-MM-DD')`;

export async function getWorkspaceAnalytics(
  userId: string,
  dates: { days: number; now: Date; since: Date },
  filter: ActivityFilter,
  pageId?: string,
) {
  const db = getDb();
  const codeDay = utcDay(scans.timestamp);
  const pageDay = utcDay(linkPageEvents.timestamp);
  const codeScope = and(eq(qrCodes.userId, userId), gte(scans.timestamp, dates.since), lte(scans.timestamp, dates.now));
  const pageScope = and(eq(linkPages.userId, userId), gte(linkPageEvents.timestamp, dates.since), lte(linkPageEvents.timestamp, dates.now),
    ne(linkPageEvents.type, "publish"), pageId ? eq(linkPages.id, pageId) : undefined);
  const codeDays = filter === "link-pages" ? [] : db.select({ day: codeDay, type: scans.type, total: count() })
    .from(scans).innerJoin(qrCodes, eq(scans.qrCodeId, qrCodes.id)).where(codeScope).groupBy(codeDay, scans.type);
  const pageDays = filter === "codes" ? [] : db.select({ day: pageDay, type: linkPageEvents.type, total: count() })
    .from(linkPageEvents).innerJoin(linkPages, eq(linkPageEvents.pageId, linkPages.id)).where(pageScope)
    .groupBy(pageDay, linkPageEvents.type);
  const topCodes = filter === "link-pages" ? [] : db.select({
    id: qrCodes.id, title: qrCodes.ogTitle, destination: qrCodes.redirectUrl, total: count(),
  }).from(scans).innerJoin(qrCodes, eq(scans.qrCodeId, qrCodes.id)).where(codeScope)
    .groupBy(qrCodes.id).orderBy(desc(count()), qrCodes.id).limit(5);
  const topPages = filter === "codes" || pageId ? [] : db.select({
    id: linkPages.id, slug: linkPages.slug, title: sql<string | null>`${linkPages.published} ->> 'name'`, total: count(),
  }).from(linkPageEvents).innerJoin(linkPages, eq(linkPageEvents.pageId, linkPages.id)).where(pageScope)
    .groupBy(linkPages.id).orderBy(desc(count()), linkPages.id).limit(5);

  const [codes, pages, rankedCodes, rankedPages] = await Promise.all([codeDays, pageDays, topCodes, topPages]);
  const today = Math.floor(dates.now.getTime() / dayMs) * dayMs;
  const days = new Map<string, ActivityCounts & { date: string }>(Array.from({ length: dates.days }, (_, index) => {
    const date = new Date(today - (dates.days - 1 - index) * dayMs).toISOString().slice(0, 10);
    return [date, { date, ...emptyCounts }];
  }));
  const totals = { ...emptyCounts };
  for (const row of codes) {
    const day = days.get(row.day);
    if (!day) continue;
    const metric = row.type === "click" ? "codeOpens" : "codeScans";
    day[metric] += row.total;
    totals[metric] += row.total;
  }
  for (const row of pages) {
    const day = days.get(row.day);
    if (!day || row.type === "publish") continue;
    const metric = pageMetrics[row.type];
    day[metric] += row.total;
    totals[metric] += row.total;
  }

  const ranked = [
    ...rankedCodes.map(({ id, title, destination, total }) => ({
      title: title?.trim() || destination, source: "Code", href: `/analytics/${encodeURIComponent(id)}`, total,
    })),
    ...rankedPages.map(({ id, title, slug, total }) => ({
      title: title?.trim() || slug, source: "Link page", href: `/history?tab=link-pages&page=${encodeURIComponent(id)}&days=${dates.days}`, total,
    })),
  ].sort((a, b) => b.total - a.total).slice(0, 5);

  return { daily: Array.from(days.values()), ranked, totals };
}
