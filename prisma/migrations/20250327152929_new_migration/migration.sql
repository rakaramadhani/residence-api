-- CreateEnum
CREATE TYPE "Role" AS ENUM ('penghuni', 'admin');

-- CreateEnum
CREATE TYPE "TipeRumah" AS ENUM ('ChairaTownHouse', 'GrandCeleste', 'Calosa');

-- CreateEnum
CREATE TYPE "StatusBayar" AS ENUM ('belumLunas', 'lunas');

-- CreateEnum
CREATE TYPE "MetodeBayar" AS ENUM ('manual', 'otomatis');

-- CreateEnum
CREATE TYPE "StatusBroadcast" AS ENUM ('uploaded', 'verifying', 'approved');

-- CreateEnum
CREATE TYPE "StatusPerkawinan" AS ENUM ('BelumMenikah', 'Menikah');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Pria', 'Wanita');

-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('Keamanan', 'Infrastruktur', 'Kebersihan', 'Pelayanan', 'Lainnya');

-- CreateEnum
CREATE TYPE "StatusPengaduan" AS ENUM ('PengajuanBaru', 'Ditangani', 'Selesai');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'penghuni',
    "blok_rumah" TEXT,
    "tipe_rumah" "TipeRumah",
    "isVerified" BOOLEAN,
    "feedback" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tagihan" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "metode_bayar" "MetodeBayar" NOT NULL DEFAULT 'otomatis',
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "nominal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_bayar" "StatusBayar" NOT NULL DEFAULT 'belumLunas',

    CONSTRAINT "Tagihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "orderId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "grossAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "transactionStatus" TEXT NOT NULL,
    "fraudStatus" TEXT NOT NULL,
    "vaBank" TEXT,
    "vaNumber" TEXT,
    "transactionTime" TIMESTAMP(3),
    "settlementTime" TIMESTAMP(3),
    "expiryTime" TIMESTAMP(3),

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "broadcast" TEXT NOT NULL,
    "tanggal_acara" TIMESTAMP(3) NOT NULL,
    "status_broadcast" "StatusBroadcast" NOT NULL DEFAULT 'uploaded',
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anggota" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "tempat_lahir" TEXT NOT NULL,
    "tanggal_lahir" TIMESTAMP(3) NOT NULL,
    "agama" TEXT NOT NULL,
    "status_perkawinan" "StatusPerkawinan" NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "warga_negara" TEXT NOT NULL,
    "ktp" TEXT NOT NULL,

    CONSTRAINT "Anggota_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "Peraturan" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Peraturan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panic" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Panic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Tagihan" ADD CONSTRAINT "Tagihan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Tagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anggota" ADD CONSTRAINT "Anggota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengaduan" ADD CONSTRAINT "Pengaduan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panic" ADD CONSTRAINT "Panic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
