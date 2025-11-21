-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RoomMember" ADD COLUMN     "isAdmin" BOOLEAN DEFAULT false;
