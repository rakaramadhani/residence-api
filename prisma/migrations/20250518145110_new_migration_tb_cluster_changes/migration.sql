/*
  Warnings:

  - The primary key for the `Cluster` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Cluster` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `clusterId` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_clusterId_fkey";

-- AlterTable
ALTER TABLE "Cluster" DROP CONSTRAINT "Cluster_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clusterId",
ADD COLUMN     "clusterId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
