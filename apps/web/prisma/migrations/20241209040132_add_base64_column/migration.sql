/*
  Warnings:

  - Added the required column `base64` to the `QRCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QRCode" ADD COLUMN "base64" TEXT NOT NULL DEFAULT '';
