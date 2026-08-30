CREATE TABLE "CapturedCode" (
	"id" text PRIMARY KEY NOT NULL,
	"clientId" text NOT NULL,
	"userId" text NOT NULL,
	"kind" text DEFAULT 'url' NOT NULL,
	"rawValue" text NOT NULL,
	"normalizedUrl" text NOT NULL,
	"host" text NOT NULL,
	"source" text NOT NULL,
	"capturedAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "CapturedCode" ADD CONSTRAINT "CapturedCode_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "CapturedCode_userId_idx" ON "CapturedCode" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX "CapturedCode_capturedAt_idx" ON "CapturedCode" USING btree ("capturedAt");
--> statement-breakpoint
CREATE UNIQUE INDEX "CapturedCode_userId_clientId_key" ON "CapturedCode" USING btree ("userId", "clientId");
