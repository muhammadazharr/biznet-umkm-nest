/*
  Warnings:

  - You are about to drop the column `status` on the `Toko` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."StatusPendaftar" AS ENUM ('menunggu', 'diterima', 'ditolak');

-- AlterTable
ALTER TABLE "public"."Toko" DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."StatusToko";

-- CreateTable
CREATE TABLE "public"."Pendaftar" (
    "id" SERIAL NOT NULL,
    "nib" TEXT NOT NULL,
    "nama_pemilik" TEXT NOT NULL,
    "nama_toko" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "public"."StatusPendaftar" NOT NULL,

    CONSTRAINT "Pendaftar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pendaftar_email_key" ON "public"."Pendaftar"("email");
