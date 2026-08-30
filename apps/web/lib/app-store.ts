import {
  Environment,
  SignedDataVerifier,
  type JWSTransactionDecodedPayload,
  type ResponseBodyV2DecodedPayload,
} from "@apple/app-store-server-library";
import { eq, or } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";

export const APP_STORE_PRODUCT_ID = "me.teag.scanner.pro.monthly";
const APP_BUNDLE_ID = "me.teag.scanner";
const APP_APPLE_ID = 6784932487;
const APPLE_ROOT_URLS = [
  "https://www.apple.com/appleca/AppleIncRootCertificate.cer",
  "https://www.apple.com/certificateauthority/AppleRootCA-G2.cer",
  "https://www.apple.com/certificateauthority/AppleRootCA-G3.cer",
];

let rootsPromise: Promise<Buffer[]> | undefined;

async function getAppleRoots() {
  rootsPromise ??= Promise.all(
    APPLE_ROOT_URLS.map(async (url) => {
      const response = await fetch(url, { cache: "force-cache" });
      if (!response.ok) throw new Error("Unable to load Apple root certificate");
      return Buffer.from(await response.arrayBuffer());
    })
  );
  return rootsPromise;
}

async function verifier(environment: Environment) {
  return new SignedDataVerifier(
    await getAppleRoots(),
    true,
    environment,
    APP_BUNDLE_ID,
    environment === Environment.PRODUCTION ? APP_APPLE_ID : undefined
  );
}

export async function verifyAppStoreTransaction(signedTransaction: string) {
  let lastError: unknown;
  for (const environment of [Environment.PRODUCTION, Environment.SANDBOX, Environment.XCODE]) {
    try {
      return await (await verifier(environment)).verifyAndDecodeTransaction(signedTransaction);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Invalid App Store transaction");
}

export async function verifyAppStoreNotification(signedPayload: string) {
  let lastError: unknown;
  for (const environment of [Environment.PRODUCTION, Environment.SANDBOX, Environment.XCODE]) {
    try {
      return await (await verifier(environment)).verifyAndDecodeNotification(signedPayload);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Invalid App Store notification");
}

export async function getOrCreateAppStoreAccountToken(userId: string) {
  const database = getDb();
  const [existing] = await database
    .select({ token: subscriptions.appStoreAccountToken })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  if (existing?.token) return existing.token;

  const token = crypto.randomUUID();
  await database
    .insert(subscriptions)
    .values({ id: crypto.randomUUID(), userId, appStoreAccountToken: token, plan: "FREE", status: "active" })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: { appStoreAccountToken: token, updatedAt: new Date() },
    });
  const [saved] = await database
    .select({ token: subscriptions.appStoreAccountToken })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  if (!saved?.token) throw new Error("Unable to create App Store account token");
  return saved.token;
}

function transactionStatus(transaction: JWSTransactionDecodedPayload) {
  if (transaction.revocationDate) return "revoked";
  if (!transaction.expiresDate || transaction.expiresDate <= Date.now()) return "expired";
  return "active";
}

export async function applyVerifiedTransaction(userId: string, transaction: JWSTransactionDecodedPayload) {
  if (
    transaction.productId !== APP_STORE_PRODUCT_ID ||
    !transaction.originalTransactionId ||
    !transaction.transactionId ||
    !transaction.appAccountToken ||
    !transaction.expiresDate
  ) {
    throw new Error("Transaction does not match teag.me Pro");
  }

  const token = await getOrCreateAppStoreAccountToken(userId);
  if (transaction.appAccountToken.toLowerCase() !== token.toLowerCase()) {
    throw new Error("This App Store subscription belongs to a different teag.me account");
  }

  const database = getDb();
  const [linked] = await database
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .where(eq(subscriptions.appStoreOriginalTransactionId, transaction.originalTransactionId))
    .limit(1);
  if (linked && linked.userId !== userId) {
    throw new Error("This App Store subscription is already linked to another account");
  }

  const status = transactionStatus(transaction);
  const expiresAt = new Date(transaction.expiresDate);
  await database
    .update(subscriptions)
    .set({
      plan: status === "active" ? "PRO" : "FREE",
      appStoreOriginalTransactionId: transaction.originalTransactionId,
      appStoreTransactionId: transaction.transactionId,
      appStoreProductId: transaction.productId,
      appStoreEnvironment: String(transaction.environment ?? "Unknown"),
      appStoreStatus: status,
      appStoreExpiresAt: expiresAt,
      appStoreLastVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, userId));

  return { active: status === "active", status, expiresAt, productId: transaction.productId };
}

export async function applyVerifiedNotification(notification: ResponseBodyV2DecodedPayload) {
  const signedTransaction = notification.data?.signedTransactionInfo;
  if (!signedTransaction) return false;
  const transaction = await verifyAppStoreTransaction(signedTransaction);
  if (transaction.productId !== APP_STORE_PRODUCT_ID || !transaction.originalTransactionId) return false;

  const numericStatus = Number(notification.data?.status);
  const status = transaction.revocationDate
    ? "revoked"
    : numericStatus === 4
      ? "grace_period"
      : numericStatus === 1
        ? "active"
        : transactionStatus(transaction);
  const expiresAt = transaction.expiresDate ? new Date(transaction.expiresDate) : null;
  const database = getDb();
  const updated = await database
    .update(subscriptions)
    .set({
      plan: status === "active" || status === "grace_period" ? "PRO" : "FREE",
      appStoreOriginalTransactionId: transaction.originalTransactionId,
      appStoreTransactionId: transaction.transactionId,
      appStoreProductId: transaction.productId,
      appStoreStatus: status,
      appStoreExpiresAt: expiresAt,
      appStoreEnvironment: String(transaction.environment ?? notification.data?.environment ?? "Unknown"),
      appStoreLastVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      or(
        eq(subscriptions.appStoreOriginalTransactionId, transaction.originalTransactionId),
        transaction.appAccountToken
          ? eq(subscriptions.appStoreAccountToken, transaction.appAccountToken)
          : eq(subscriptions.appStoreOriginalTransactionId, transaction.originalTransactionId)
      )
    )
    .returning({ id: subscriptions.id });
  return updated.length > 0;
}
