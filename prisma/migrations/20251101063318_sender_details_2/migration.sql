/*
  Warnings:

  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_userId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
