import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
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
      .references(() => users.id),
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
  sessions: many(sessions),
  accounts: many(accounts),
  subscription: one(subscriptions),
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
