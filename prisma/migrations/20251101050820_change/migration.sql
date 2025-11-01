/*
  Warnings:

  - You are about to drop the column `isGroup` on the `Room` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('PRIVATE', 'GROUP', 'CHANNEL');

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "isGroup",
ADD COLUMN     "roomType" "RoomType" NOT NULL DEFAULT 'PRIVATE';
