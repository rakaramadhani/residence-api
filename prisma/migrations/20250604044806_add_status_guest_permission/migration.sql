-- CreateEnum
CREATE TYPE "StatusTamu" AS ENUM ('scheduled', 'arrived');

-- AlterTable
ALTER TABLE "GuestPermission" ADD COLUMN     "status" "StatusTamu" NOT NULL DEFAULT 'scheduled';
