/*
  Warnings:

  - You are about to drop the `_KategoriToProduk` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."VisibilitasProduk" AS ENUM ('tampilkan', 'sembunyikan');

-- DropForeignKey
ALTER TABLE "public"."_KategoriToProduk" DROP CONSTRAINT "_KategoriToProduk_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_KategoriToProduk" DROP CONSTRAINT "_KategoriToProduk_B_fkey";

-- AlterTable
ALTER TABLE "public"."Produk" ADD COLUMN     "kategoriId" INTEGER,
ADD COLUMN     "status" "public"."VisibilitasProduk" NOT NULL DEFAULT 'tampilkan';

-- DropTable
DROP TABLE "public"."_KategoriToProduk";

-- AddForeignKey
ALTER TABLE "public"."Produk" ADD CONSTRAINT "Produk_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "public"."Kategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;
