import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
} from "drizzle-orm";
import { getDb } from "./index";
import { capturedCodes, qrCodes, scans, users } from "./schema";

type ScanPreview = {
  id: string;
  timestamp: Date;
  country: string | null;
};

type ScanDetail = {
  id: string;
  timestamp: Date;
  country: string | null;
  city: string | null;
  region: string | null;
  userAgent?: string;
  ip?: string;
};

function groupScans<T extends { qrCodeId: string }>(
  rows: T[]
): Record<string, Omit<T, "qrCodeId">[]> {
  return rows.reduce<Record<string, Omit<T, "qrCodeId">[]>>((acc, row) => {
    const { qrCodeId, ...scan } = row;
    acc[qrCodeId] ??= [];
    acc[qrCodeId].push(scan);
    return acc;
  }, {});
}

export async function findQrCodeById(id: string) {
  const [qrCode] = await getDb()
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.id, id))
    .limit(1);

  return qrCode ?? null;
}

export async function findUserById(id: string) {
  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user ?? null;
}

export async function findUserRole(id: string) {
  const [user] = await getDb()
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user?.role ?? null;
}

export async function upsertUser(userData: {
  id: string;
  email: string;
  name?: string | null;
}) {
  const [user] = await getDb()
    .insert(users)
    .values({
      id: userData.id,
      email: userData.email,
      name: userData.name ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: userData.email,
        name: userData.name ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return user;
}

export async function createQrCode(values: typeof qrCodes.$inferInsert) {
  const [qrCode] = await getDb().insert(qrCodes).values(values).returning();
  return qrCode;
}

export async function updateQrCode(
  id: string,
  values: Partial<typeof qrCodes.$inferInsert>
) {
  const [qrCode] = await getDb()
    .update(qrCodes)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(eq(qrCodes.id, id))
    .returning();

  return qrCode ?? null;
}

export async function deleteQrCode(id: string) {
  const [qrCode] = await getDb()
    .delete(qrCodes)
    .where(eq(qrCodes.id, id))
    .returning();

  return qrCode ?? null;
}

export async function createScan(values: typeof scans.$inferInsert) {
  const [scan] = await getDb().insert(scans).values(values).returning();
  return scan;
}

export async function getAnalyticsForQrCode(id: string) {
  const qrCode = await findQrCodeById(id);
  if (!qrCode) return null;

  const qrScans = await getDb()
    .select({
      id: scans.id,
      timestamp: scans.timestamp,
      country: scans.country,
      city: scans.city,
      region: scans.region,
      userAgent: scans.userAgent,
      ip: scans.ip,
    })
    .from(scans)
    .where(eq(scans.qrCodeId, id))
    .orderBy(asc(scans.timestamp));

  return {
    ...qrCode,
    scans: qrScans,
  };
}

export async function getOwnedQrCodeAnalytics(id: string, userId: string) {
  const [qrCode] = await getDb()
    .select()
    .from(qrCodes)
    .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, userId)))
    .limit(1);

  if (!qrCode) return null;

  const qrScans = await getDb()
    .select()
    .from(scans)
    .where(eq(scans.qrCodeId, id))
    .orderBy(desc(scans.timestamp));

  return {
    ...qrCode,
    scans: qrScans,
  };
}

export async function listUserQrCodes(options: {
  userId: string;
  archived: boolean;
  page: number;
  limit: number;
}) {
  const { userId, archived, page, limit } = options;
  const skip = (page - 1) * limit;
  const whereClause = and(
    eq(qrCodes.userId, userId),
    eq(qrCodes.archived, archived)
  );

  const database = getDb();
  const [{ totalCount }] = await database
    .select({ totalCount: count() })
    .from(qrCodes)
    .where(whereClause);

  const rows = await database
    .select({
      id: qrCodes.id,
      redirectUrl: qrCodes.redirectUrl,
      base64: qrCodes.base64,
      createdAt: qrCodes.createdAt,
      archived: qrCodes.archived,
    })
    .from(qrCodes)
    .where(whereClause)
    .orderBy(desc(qrCodes.createdAt))
    .limit(limit)
    .offset(skip);

  const qrCodeIds = rows.map((row) => row.id);
  const scanRows: (ScanPreview & { qrCodeId: string })[] =
    qrCodeIds.length === 0
      ? []
      : await database
          .select({
            id: scans.id,
            qrCodeId: scans.qrCodeId,
            timestamp: scans.timestamp,
            country: scans.country,
          })
          .from(scans)
          .where(inArray(scans.qrCodeId, qrCodeIds))
          .orderBy(desc(scans.timestamp));

  const scansByQrCode = groupScans(scanRows);

  return {
    qrCodes: rows.map((row) => ({
      ...row,
      scans: scansByQrCode[row.id] ?? [],
    })),
    totalCount: Number(totalCount),
  };
}

export async function listAdminQrCodes(options: {
  archived: boolean;
  page: number;
  limit: number;
}) {
  const { archived, page, limit } = options;
  const skip = (page - 1) * limit;
  const whereClause = eq(qrCodes.archived, archived);

  const database = getDb();
  const [{ totalCount }] = await database
    .select({ totalCount: count() })
    .from(qrCodes)
    .where(whereClause);

  const rows = await database
    .select({
      id: qrCodes.id,
      redirectUrl: qrCodes.redirectUrl,
      base64: qrCodes.base64,
      createdAt: qrCodes.createdAt,
      userId: qrCodes.userId,
      archived: qrCodes.archived,
      userName: users.name,
      userEmail: users.email,
    })
    .from(qrCodes)
    .leftJoin(users, eq(qrCodes.userId, users.id))
    .where(whereClause)
    .orderBy(desc(qrCodes.createdAt))
    .limit(limit)
    .offset(skip);

  const qrCodeIds = rows.map((row) => row.id);
  const scanRows: (ScanDetail & { qrCodeId: string })[] =
    qrCodeIds.length === 0
      ? []
      : await database
          .select({
            id: scans.id,
            qrCodeId: scans.qrCodeId,
            timestamp: scans.timestamp,
            country: scans.country,
            city: scans.city,
            region: scans.region,
          })
          .from(scans)
          .where(inArray(scans.qrCodeId, qrCodeIds))
          .orderBy(desc(scans.timestamp));

  const scansByQrCode = groupScans(scanRows);

  return {
    qrCodes: rows.map((row) => ({
      id: row.id,
      redirectUrl: row.redirectUrl,
      base64: row.base64,
      createdAt: row.createdAt,
      userId: row.userId,
      archived: row.archived,
      user: {
        name: row.userName,
        email: row.userEmail,
      },
      scans: scansByQrCode[row.id] ?? [],
    })),
    totalCount: Number(totalCount),
  };
}

export async function countUserCapturedCodes(userId: string) {
  const [{ totalCount }] = await getDb()
    .select({ totalCount: count() })
    .from(capturedCodes)
    .where(eq(capturedCodes.userId, userId));
  return Number(totalCount);
}

export async function findExistingCapturedClientIds(
  userId: string,
  clientIds: string[]
) {
  if (clientIds.length === 0) return new Set<string>();
  const rows = await getDb()
    .select({ clientId: capturedCodes.clientId })
    .from(capturedCodes)
    .where(
      and(
        eq(capturedCodes.userId, userId),
        inArray(capturedCodes.clientId, clientIds)
      )
    );
  return new Set(rows.map((row) => row.clientId));
}

export async function createCapturedCodes(
  values: (typeof capturedCodes.$inferInsert)[]
) {
  if (values.length === 0) return [];
  return getDb()
    .insert(capturedCodes)
    .values(values)
    .onConflictDoNothing({
      target: [capturedCodes.userId, capturedCodes.clientId],
    })
    .returning();
}

export async function listUserCapturedCodes(options: {
  userId: string;
  page: number;
  limit: number;
}) {
  const { userId, page, limit } = options;
  const database = getDb();
  const [{ totalCount }] = await database
    .select({ totalCount: count() })
    .from(capturedCodes)
    .where(eq(capturedCodes.userId, userId));

  const rows = await database
    .select()
    .from(capturedCodes)
    .where(eq(capturedCodes.userId, userId))
    .orderBy(desc(capturedCodes.capturedAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return { capturedCodes: rows, totalCount: Number(totalCount) };
}

export async function deleteUserCapturedCode(id: string, userId: string) {
  const [deleted] = await getDb()
    .delete(capturedCodes)
    .where(and(eq(capturedCodes.id, id), eq(capturedCodes.userId, userId)))
    .returning({ id: capturedCodes.id });
  return deleted ?? null;
}

export async function clearUserCapturedCodes(userId: string) {
  return getDb()
    .delete(capturedCodes)
    .where(eq(capturedCodes.userId, userId))
    .returning({ id: capturedCodes.id });
}
