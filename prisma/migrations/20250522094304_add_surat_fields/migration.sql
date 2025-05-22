/*
  Warnings:

  - Added the required column `fasilitas` to the `Surat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keperluan` to the `Surat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggalMulai` to the `Surat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggalSelesai` to the `Surat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Surat" ADD COLUMN     "fasilitas" TEXT NOT NULL,
ADD COLUMN     "keperluan" TEXT NOT NULL,
ADD COLUMN     "tanggalMulai" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tanggalSelesai" TIMESTAMP(3) NOT NULL;
