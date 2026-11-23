CREATE TYPE "public"."LinkPageEventType" AS ENUM('view', 'click', 'scan', 'publish');--> statement-breakpoint
CREATE TABLE "LinkPageEvent" (
	"id" text PRIMARY KEY NOT NULL,
	"pageId" varchar(24) NOT NULL,
	"type" "LinkPageEventType" NOT NULL,
	"blockTitle" text,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LinkPage" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"slug" varchar(40) NOT NULL,
	"draft" jsonb NOT NULL,
	"published" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"publishedAt" timestamp with time zone,
	CONSTRAINT "LinkPage_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "LinkPageEvent" ADD CONSTRAINT "LinkPageEvent_pageId_LinkPage_id_fk" FOREIGN KEY ("pageId") REFERENCES "public"."LinkPage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LinkPage" ADD CONSTRAINT "LinkPage_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "LinkPageEvent_pageId_timestamp_idx" ON "LinkPageEvent" USING btree ("pageId","timestamp");--> statement-breakpoint
CREATE INDEX "LinkPage_userId_idx" ON "LinkPage" USING btree ("userId");