ALTER TABLE "subscription" ADD COLUMN "appStoreAccountToken" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "appStoreOriginalTransactionId" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "appStoreTransactionId" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "appStoreProductId" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "appStoreEnvironment" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "appStoreStatus" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "appStoreExpiresAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "appStoreLastVerifiedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_appStoreAccountToken_unique" UNIQUE("appStoreAccountToken");--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_appStoreOriginalTransactionId_unique" UNIQUE("appStoreOriginalTransactionId");