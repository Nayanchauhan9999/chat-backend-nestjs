/*
  Warnings:

  - Made the column `isAdmin` on table `RoomMember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RoomMember" ALTER COLUMN "isAdmin" SET NOT NULL;
