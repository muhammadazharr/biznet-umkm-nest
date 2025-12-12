/*
  Warnings:

  - You are about to drop the `KategoriProduk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProdukCabang` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."KategoriProduk" DROP CONSTRAINT "KategoriProduk_kategoriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."KategoriProduk" DROP CONSTRAINT "KategoriProduk_produkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProdukCabang" DROP CONSTRAINT "ProdukCabang_cabangId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProdukCabang" DROP CONSTRAINT "ProdukCabang_produkId_fkey";

-- DropTable
DROP TABLE "public"."KategoriProduk";

-- DropTable
DROP TABLE "public"."ProdukCabang";

-- CreateTable
CREATE TABLE "public"."_KategoriToProduk" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_KategoriToProduk_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CabangTokoToProduk" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CabangTokoToProduk_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_KategoriToProduk_B_index" ON "public"."_KategoriToProduk"("B");

-- CreateIndex
CREATE INDEX "_CabangTokoToProduk_B_index" ON "public"."_CabangTokoToProduk"("B");

-- AddForeignKey
ALTER TABLE "public"."_KategoriToProduk" ADD CONSTRAINT "_KategoriToProduk_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Kategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_KategoriToProduk" ADD CONSTRAINT "_KategoriToProduk_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CabangTokoToProduk" ADD CONSTRAINT "_CabangTokoToProduk_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."CabangToko"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CabangTokoToProduk" ADD CONSTRAINT "_CabangTokoToProduk_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
