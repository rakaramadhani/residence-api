/*
  Warnings:

  - You are about to drop the column `blok_rumah` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tipe_rumah` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Cluster" AS ENUM ('ChairaTownHouse', 'GrandCeleste', 'Calosa');

-- CreateEnum
CREATE TYPE "StatusSurat" AS ENUM ('requested', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "Surat" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "status" "StatusSurat" NOT NULL DEFAULT 'requested';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "blok_rumah",
DROP COLUMN "tipe_rumah",
ADD COLUMN     "cluster" "Cluster",
ADD COLUMN     "nomor_rumah" TEXT,
ADD COLUMN     "rt" TEXT,
ADD COLUMN     "rw" TEXT;

-- DropEnum
DROP TYPE "TipeRumah";
