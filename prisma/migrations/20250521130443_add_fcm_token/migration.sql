/*
  Warnings:

  - You are about to drop the `FCM_TOKEN` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FCM_TOKEN" DROP CONSTRAINT "FCM_TOKEN_userId_fkey";

-- DropTable
DROP TABLE "FCM_TOKEN";

-- CreateTable
CREATE TABLE "fcmtoken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fcmtoken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fcmtoken" ADD CONSTRAINT "fcmtoken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
