-- CreateEnum
CREATE TYPE "Role" AS ENUM ('penghuni', 'admin');

-- CreateEnum
CREATE TYPE "TipeRumah" AS ENUM ('ChairaTownHouse', 'GrandCeleste', 'Calosa');

-- CreateEnum
CREATE TYPE "StatusBayar" AS ENUM ('verifikasi', 'lunas');

-- CreateEnum
CREATE TYPE "StatusBroadcast" AS ENUM ('uploaded', 'verifying', 'approved');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Pria', 'Wanita');

-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('Keamanan', 'Infrastruktur', 'Kebersihan', 'Pelayanan', 'Lainnya');

-- CreateEnum
CREATE TYPE "StatusKendala" AS ENUM ('PengajuanBaru', 'Ditangani', 'Selesai');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'penghuni',
    "blok_rumah" TEXT NOT NULL,
    "tipe_rumah" "TipeRumah" NOT NULL,
    "isVerified" BOOLEAN NOT NULL,
    "feedback" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Iuran" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tanggal_iuran" TIMESTAMP(3) NOT NULL,
    "tanggal_jatuh_tempo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bukti_bayar" TEXT NOT NULL,
    "status_bayar" "StatusBayar" NOT NULL,
    "feedback" TEXT NOT NULL,

    CONSTRAINT "Iuran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "broadcast" TEXT NOT NULL,
    "tanggal_acara" TIMESTAMP(3) NOT NULL,
    "status_broadcast" "StatusBroadcast" NOT NULL DEFAULT 'uploaded',
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anggota" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "tempat_lahir" TEXT NOT NULL,
    "tanggal_lahir" TIMESTAMP(3) NOT NULL,
    "ktp" TEXT NOT NULL,

    CONSTRAINT "Anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kendala" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "kendala" TEXT NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "status_kendala" "StatusKendala" NOT NULL,
    "feedback" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kendala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Peraturan" (
    "id" SERIAL NOT NULL,
    "peraturan" TEXT NOT NULL,

    CONSTRAINT "Peraturan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panic" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Panic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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
