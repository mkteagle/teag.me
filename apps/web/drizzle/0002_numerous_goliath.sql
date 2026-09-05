ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;