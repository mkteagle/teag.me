CREATE TABLE "MonthlyScanUsage" (
	"userId" text NOT NULL,
	"monthStart" timestamp with time zone NOT NULL,
	"scanCount" integer NOT NULL,
	CONSTRAINT "MonthlyScanUsage_userId_monthStart_pk" PRIMARY KEY("userId","monthStart")
);
--> statement-breakpoint
ALTER TABLE "MonthlyScanUsage" ADD CONSTRAINT "MonthlyScanUsage_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;