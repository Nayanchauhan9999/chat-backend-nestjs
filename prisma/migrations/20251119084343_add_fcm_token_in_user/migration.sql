/*
  Warnings:

  - You are about to drop the column `isRevoked` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "isRevoked";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fcmToken" TEXT;
