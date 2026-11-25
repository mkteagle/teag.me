import { and, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { linkPageEvents, linkPages, qrCodes, scans } from "@/lib/db/schema";

export type ActivityItem = {
  id: string;
  source: "codes" | "link-pages";
  action: string;
  title: string;
  detail?: string | null;
  location?: string;
  href: string;
  timestamp: Date;
};

const eventNames = { view: "Page viewed", click: "Link opened", scan: "Page QR scanned", publish: "Page published" };

export async function getWorkspaceActivity(userId: string, since: Date | null, filter: "all" | ActivityItem["source"]) {
  const db = getDb();
  const codeRows = filter === "link-pages" ? [] : db.select({
    id: scans.id, timestamp: scans.timestamp, type: scans.type,
    codeId: qrCodes.id, title: qrCodes.ogTitle, destination: qrCodes.redirectUrl,
  }).from(scans).innerJoin(qrCodes, eq(scans.qrCodeId, qrCodes.id))
    .where(and(eq(qrCodes.userId, userId), since ? gte(scans.timestamp, since) : undefined))
    .orderBy(desc(scans.timestamp)).limit(50);

  const linkRows = filter === "codes" ? [] : db.select({
    id: linkPageEvents.id, timestamp: linkPageEvents.timestamp, type: linkPageEvents.type,
    pageId: linkPages.id, slug: linkPages.slug, blockTitle: linkPageEvents.blockTitle,
    city: linkPageEvents.city, region: linkPageEvents.region, country: linkPageEvents.country,
    title: sql<string>`${linkPages.published} ->> 'name'`,
  }).from(linkPageEvents).innerJoin(linkPages, eq(linkPageEvents.pageId, linkPages.id))
    .where(and(eq(linkPages.userId, userId), since ? gte(linkPageEvents.timestamp, since) : undefined))
    .orderBy(desc(linkPageEvents.timestamp)).limit(50);

  const [codes, pages] = await Promise.all([codeRows, linkRows]);
  const items: ActivityItem[] = [
    ...codes.map((code) => ({
      id: code.id, source: "codes" as const, timestamp: code.timestamp, action: code.type === "click" ? "Code link opened" : "Code scanned",
      title: code.title || code.destination, href: `/analytics/${code.codeId}`,
    })),
    ...pages.map((page) => ({
      id: page.id, source: "link-pages" as const, timestamp: page.timestamp, action: eventNames[page.type],
      title: page.title || page.slug, detail: page.blockTitle, href: `/link-pages/${page.pageId}`,
      location: [page.city, page.region, page.country].filter(Boolean).join(", "),
    })),
  ];
  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);
}
