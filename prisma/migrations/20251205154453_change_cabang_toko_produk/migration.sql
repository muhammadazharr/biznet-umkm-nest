/*
  Warnings:

  - You are about to drop the `_CabangTokoToProduk` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_CabangTokoToProduk" DROP CONSTRAINT "_CabangTokoToProduk_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CabangTokoToProduk" DROP CONSTRAINT "_CabangTokoToProduk_B_fkey";

-- DropTable
DROP TABLE "public"."_CabangTokoToProduk";

-- CreateTable
CREATE TABLE "public"."ProdukCabang" (
    "id" SERIAL NOT NULL,
    "produkId" INTEGER NOT NULL,
    "cabangId" INTEGER NOT NULL,
    "status" "public"."StatusProduk" NOT NULL DEFAULT 'tersedia',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdukCabang_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ProdukCabang" ADD CONSTRAINT "ProdukCabang_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "public"."Produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProdukCabang" ADD CONSTRAINT "ProdukCabang_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "public"."CabangToko"("id") ON DELETE CASCADE ON UPDATE CASCADE;
