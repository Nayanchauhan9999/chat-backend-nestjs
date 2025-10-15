-- DropIndex
DROP INDEX "public"."User_id_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp" INTEGER;
