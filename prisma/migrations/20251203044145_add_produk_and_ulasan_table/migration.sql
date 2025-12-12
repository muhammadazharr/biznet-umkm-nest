-- CreateEnum
CREATE TYPE "public"."StatusProduk" AS ENUM ('tersedia', 'habis');

-- CreateTable
CREATE TABLE "public"."Produk" (
    "id" SERIAL NOT NULL,
    "nama_produk" TEXT NOT NULL,
    "deskripsi" TEXT,
    "slug" TEXT NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "thumbnail" TEXT,
    "tokoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produk_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."KategoriProduk" (
    "id" SERIAL NOT NULL,
    "produkId" INTEGER NOT NULL,
    "kategoriId" INTEGER NOT NULL,

    CONSTRAINT "KategoriProduk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ulasan" (
    "id" SERIAL NOT NULL,
    "produkId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "nilai" INTEGER NOT NULL,
    "komentar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ulasan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Produk_slug_key" ON "public"."Produk"("slug");

-- AddForeignKey
ALTER TABLE "public"."Produk" ADD CONSTRAINT "Produk_tokoId_fkey" FOREIGN KEY ("tokoId") REFERENCES "public"."Toko"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProdukCabang" ADD CONSTRAINT "ProdukCabang_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "public"."Produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProdukCabang" ADD CONSTRAINT "ProdukCabang_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "public"."CabangToko"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KategoriProduk" ADD CONSTRAINT "KategoriProduk_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "public"."Produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KategoriProduk" ADD CONSTRAINT "KategoriProduk_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "public"."Kategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ulasan" ADD CONSTRAINT "Ulasan_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "public"."Produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
