/*
  Warnings:

  - The primary key for the `Anggota` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Broadcast` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Iuran` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Kendala` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Panic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `Anggota` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Anggota` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Broadcast` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Broadcast` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Iuran` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Iuran` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Kendala` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Kendala` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Panic` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Anggota" DROP CONSTRAINT "Anggota_userId_fkey";

-- DropForeignKey
ALTER TABLE "Broadcast" DROP CONSTRAINT "Broadcast_userId_fkey";

-- DropForeignKey
ALTER TABLE "Iuran" DROP CONSTRAINT "Iuran_userId_fkey";

-- DropForeignKey
ALTER TABLE "Kendala" DROP CONSTRAINT "Kendala_userId_fkey";

-- DropForeignKey
ALTER TABLE "Panic" DROP CONSTRAINT "Panic_userId_fkey";

-- AlterTable
ALTER TABLE "Anggota" DROP CONSTRAINT "Anggota_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "Anggota_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Broadcast" DROP CONSTRAINT "Broadcast_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Iuran" DROP CONSTRAINT "Iuran_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "Iuran_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Kendala" DROP CONSTRAINT "Kendala_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ALTER COLUMN "status_kendala" SET DEFAULT 'PengajuanBaru',
ALTER COLUMN "feedback" DROP NOT NULL,
ADD CONSTRAINT "Kendala_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Panic" DROP CONSTRAINT "Panic_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "Panic_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Panic_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "blok_rumah" DROP NOT NULL,
ALTER COLUMN "tipe_rumah" DROP NOT NULL,
ALTER COLUMN "isVerified" DROP NOT NULL,
ALTER COLUMN "feedback" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Iuran" ADD CONSTRAINT "Iuran_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anggota" ADD CONSTRAINT "Anggota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kendala" ADD CONSTRAINT "Kendala_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panic" ADD CONSTRAINT "Panic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
