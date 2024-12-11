-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_qrCodeId_fkey";

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
