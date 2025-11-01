-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "roomId" TEXT;

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "unreadMessagesCount" INTEGER NOT NULL DEFAULT 0,
    "messageId" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
