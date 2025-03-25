/*
  Warnings:

  - You are about to drop the column `bukti_bayar` on the `Iuran` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `Iuran` table. All the data in the column will be lost.
  - You are about to drop the column `tanggal_iuran` on the `Iuran` table. All the data in the column will be lost.
  - You are about to drop the column `tanggal_jatuh_tempo` on the `Iuran` table. All the data in the column will be lost.
  - You are about to drop the column `peraturan` on the `Peraturan` table. All the data in the column will be lost.
  - You are about to drop the `Kendala` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bulan` to the `Iuran` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nominal` to the `Iuran` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahun` to the `Iuran` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Peraturan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Peraturan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Peraturan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusPengaduan" AS ENUM ('PengajuanBaru', 'Ditangani', 'Selesai');

-- DropForeignKey
ALTER TABLE "Kendala" DROP CONSTRAINT "Kendala_userId_fkey";

-- AlterTable
ALTER TABLE "Iuran" DROP COLUMN "bukti_bayar",
DROP COLUMN "feedback",
DROP COLUMN "tanggal_iuran",
DROP COLUMN "tanggal_jatuh_tempo",
ADD COLUMN     "bulan" INTEGER NOT NULL,
ADD COLUMN     "nominal" INTEGER NOT NULL,
ADD COLUMN     "tahun" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Peraturan" DROP COLUMN "peraturan",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Kendala";

-- DropEnum
DROP TYPE "StatusKendala";

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "midtransOrderId" TEXT NOT NULL,
    "totalNominal" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "paidMonth" INTEGER NOT NULL,
    "paidYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengaduan" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "pengaduan" TEXT NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "status_pengaduan" "StatusPengaduan" NOT NULL DEFAULT 'PengajuanBaru',
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengaduan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaksi_midtransOrderId_key" ON "Transaksi"("midtransOrderId");

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengaduan" ADD CONSTRAINT "Pengaduan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
