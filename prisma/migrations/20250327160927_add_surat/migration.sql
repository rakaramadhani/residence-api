-- CreateTable
CREATE TABLE "Surat" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "anggotaId" UUID NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Surat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Surat" ADD CONSTRAINT "Surat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Surat" ADD CONSTRAINT "Surat_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
