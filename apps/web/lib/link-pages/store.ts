import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { linkPageEvents, linkPages, users } from "@/lib/db/schema";
import { generateId } from "@/lib/ids";
import { getUserPlan, trackScanWithinQuota } from "@/lib/plan-enforcement";
import { defaultContent, type LinkPageContent } from "./model";

export class LinkPageError extends Error {}

const hasUnpublishedChanges = sql<boolean>`coalesce(${linkPages.published} <> ${linkPages.draft}, false)`;

export function listLinkPages(userId: string) {
  return getDb().select({
    id: linkPages.id,
    slug: linkPages.slug,
    name: sql<string>`${linkPages.draft} ->> 'name'`,
    publishedAt: linkPages.publishedAt,
    updatedAt: linkPages.updatedAt,
  }).from(linkPages).where(eq(linkPages.userId, userId)).orderBy(desc(linkPages.updatedAt));
}

export async function ownerLinkPage(id: string, userId: string) {
  const [page] = await getDb().select({
    id: linkPages.id,
    slug: linkPages.slug,
    draft: linkPages.draft,
    version: linkPages.version,
    publishedAt: linkPages.publishedAt,
    hasUnpublishedChanges,
  }).from(linkPages).where(and(eq(linkPages.id, id), eq(linkPages.userId, userId)));
  return page;
}

export async function publicLinkPage(slug: string) {
  const [page] = await getDb().select({
    id: linkPages.id, slug: linkPages.slug, userId: linkPages.userId, content: linkPages.published,
  }).from(linkPages).where(and(eq(linkPages.slug, slug), isNotNull(linkPages.published)));
  return page?.content ? { ...page, content: page.content } : null;
}

export async function createLinkPage(userId: string, slug: string, name: string) {
  return getDb().transaction(async (transaction) => {
    await transaction.select({ id: users.id }).from(users).where(eq(users.id, userId)).for("update");
    const { limits } = await getUserPlan(userId, transaction);
    if (limits.maxLinkPages >= 0) {
      const [{ total }] = await transaction.select({ total: count() })
        .from(linkPages).where(eq(linkPages.userId, userId));
      if (total >= limits.maxLinkPages) {
        throw new LinkPageError("Free includes one link page. Upgrade to Pro to create more.");
      }
    }
    const [page] = await transaction.insert(linkPages).values({
      id: generateId(), userId, slug, draft: { ...defaultContent, name },
    }).onConflictDoNothing({ target: linkPages.slug }).returning({ id: linkPages.id });
    if (!page) throw new LinkPageError("That page address is already in use. Choose another.");
    return page;
  });
}

export async function updateLinkPage(
  userId: string, id: string, version: number, content: LinkPageContent, publish: boolean,
) {
  return getDb().transaction(async (transaction) => {
    const now = new Date();
    const [page] = await transaction.update(linkPages).set({
      draft: content, updatedAt: now, version: version + 1,
      ...(publish ? { published: content, publishedAt: now } : {}),
    }).where(and(eq(linkPages.id, id), eq(linkPages.userId, userId), eq(linkPages.version, version)))
      .returning({ version: linkPages.version, publishedAt: linkPages.publishedAt, hasUnpublishedChanges });
    if (!page) throw new LinkPageError("This page changed in another tab. Reload before saving again.");
    if (publish) await transaction.insert(linkPageEvents).values({ id: generateId(), pageId: id, type: "publish" });
    return { version: page.version, published: Boolean(page.publishedAt), hasUnpublishedChanges: page.hasUnpublishedChanges };
  });
}

export async function removeLinkPage(userId: string, id: string) {
  await getDb().delete(linkPages).where(and(eq(linkPages.id, id), eq(linkPages.userId, userId)));
}

type LinkPageClickDetails = Pick<typeof linkPageEvents.$inferInsert, "blockTitle" | "country" | "region" | "city">;

export async function recordLinkPageEvent(
  page: { id: string; userId: string },
  type: "view" | "click" | "scan",
  clickDetails?: LinkPageClickDetails,
) {
  try {
    const values = { id: generateId(), pageId: page.id, type, ...clickDetails };
    if (type === "scan") {
      await trackScanWithinQuota(page.userId, async (transaction, timestamp) => {
        await transaction.insert(linkPageEvents).values({ ...values, timestamp });
        return true;
      });
      return;
    }
    await getDb().insert(linkPageEvents).values(values);
  } catch (error) {
    console.error("Failed to record link page activity", error);
  }
}
