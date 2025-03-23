-- AlterTable
ALTER TABLE "Broadcast" ALTER COLUMN "feedback" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;
