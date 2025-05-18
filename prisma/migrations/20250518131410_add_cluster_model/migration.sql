-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clusterId" UUID;

-- CreateTable
CREATE TABLE "Cluster" (
    "id" UUID NOT NULL,
    "nama_cluster" TEXT NOT NULL,
    "nominal_tagihan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cluster_nama_cluster_key" ON "Cluster"("nama_cluster");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
