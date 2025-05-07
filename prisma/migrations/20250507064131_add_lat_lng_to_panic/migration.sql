/*
  Warnings:

  - Added the required column `kategori` to the `Broadcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Panic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Panic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Broadcast" ADD COLUMN     "kategori" "Kategori_Broadcast" NOT NULL;

-- AlterTable
ALTER TABLE "Panic" ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
