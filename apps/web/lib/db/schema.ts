import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("Role", ["USER", "ADMIN"]);

export const users = pgTable("User", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: boolean("emailVerified").notNull().default(false),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const qrCodes = pgTable(
  "QRCode",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    redirectUrl: text("redirectUrl").notNull(),
    base64: text("base64").notNull(),
    routingUrl: text("routingUrl").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    logoUrl: text("logoUrl"),
    logoSize: integer("logoSize"),
    archived: boolean("archived").notNull().default(false),
    ogTitle: text("ogTitle"),
    ogDescription: text("ogDescription"),
    ogImage: text("ogImage"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("QRCode_userId_idx").on(table.userId),
    archivedIdx: index("QRCode_archived_idx").on(table.archived),
  })
);

export const scans = pgTable(
  "Scan",
  {
    id: text("id").primaryKey(),
    qrCodeId: varchar("qrCodeId", { length: 50 })
      .notNull()
      .references(() => qrCodes.id, { onDelete: "cascade" }),
    ip: text("ip").notNull(),
    userAgent: text("userAgent").notNull(),
    country: text("country"),
    city: text("city"),
    region: text("region"),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    type: text("type"),
    referrer: text("referrer"),
    source: text("source"),
    medium: text("medium"),
    device: text("device"),
    browser: text("browser"),
  },
  (table) => ({
    qrCodeIdIdx: index("Scan_qrCodeId_idx").on(table.qrCodeId),
  })
);

export const capturedCodes = pgTable(
  "CapturedCode",
  {
    id: text("id").primaryKey(),
    clientId: text("clientId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("url"),
    rawValue: text("rawValue").notNull(),
    normalizedUrl: text("normalizedUrl").notNull(),
    host: text("host").notNull(),
    source: text("source").notNull(),
    capturedAt: timestamp("capturedAt", { withTimezone: true, mode: "date" })
      .notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("CapturedCode_userId_idx").on(table.userId),
    capturedAtIdx: index("CapturedCode_capturedAt_idx").on(table.capturedAt),
    userClientIdx: uniqueIndex("CapturedCode_userId_clientId_key").on(
      table.userId,
      table.clientId
    ),
  })
);

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { withTimezone: true, mode: "date" })
      .notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userIdIdx: index("session_userId_idx").on(table.userId),
    tokenIdx: index("session_token_idx").on(table.token),
  })
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
      withTimezone: true,
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
      withTimezone: true,
      mode: "date",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("account_userId_idx").on(table.userId),
    providerAccountIdx: index("account_provider_account_idx").on(
      table.providerId,
      table.accountId
    ),
  })
);

export const verifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true, mode: "date" })
      .notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  })
);

// WebAuthn / passkey credentials (better-auth passkey plugin).
export const passkeys = pgTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("publicKey").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialID: text("credentialID").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("deviceType").notNull(),
    backedUp: boolean("backedUp").notNull(),
    transports: text("transports"),
    aaguid: text("aaguid"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("passkey_userId_idx").on(table.userId),
    credentialIdx: index("passkey_credentialID_idx").on(table.credentialID),
  })
);

export const planEnum = pgEnum("Plan", ["FREE", "PRO"]);

export const subscriptions = pgTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  plan: planEnum("plan").notNull().default("FREE"),
  stripeCustomerId: text("stripeCustomerId").unique(),
  stripeSubscriptionId: text("stripeSubscriptionId").unique(),
  stripePriceId: text("stripePriceId"),
  appStoreAccountToken: text("appStoreAccountToken").unique(),
  appStoreOriginalTransactionId: text("appStoreOriginalTransactionId").unique(),
  appStoreTransactionId: text("appStoreTransactionId"),
  appStoreProductId: text("appStoreProductId"),
  appStoreEnvironment: text("appStoreEnvironment"),
  appStoreStatus: text("appStoreStatus"),
  appStoreExpiresAt: timestamp("appStoreExpiresAt", {
    withTimezone: true,
    mode: "date",
  }),
  appStoreLastVerifiedAt: timestamp("appStoreLastVerifiedAt", {
    withTimezone: true,
    mode: "date",
  }),
  status: text("status").notNull().default("active"),
  currentPeriodStart: timestamp("currentPeriodStart", {
    withTimezone: true,
    mode: "date",
  }),
  currentPeriodEnd: timestamp("currentPeriodEnd", {
    withTimezone: true,
    mode: "date",
  }),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  qrCodes: many(qrCodes),
  capturedCodes: many(capturedCodes),
  sessions: many(sessions),
  accounts: many(accounts),
  passkeys: many(passkeys),
  subscription: one(subscriptions),
}));

export const passkeysRelations = relations(passkeys, ({ one }) => ({
  user: one(users, {
    fields: [passkeys.userId],
    references: [users.id],
  }),
}));

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  user: one(users, {
    fields: [qrCodes.userId],
    references: [users.id],
  }),
  scans: many(scans),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [scans.qrCodeId],
    references: [qrCodes.id],
  }),
}));

export const capturedCodesRelations = relations(capturedCodes, ({ one }) => ({
  user: one(users, {
    fields: [capturedCodes.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
