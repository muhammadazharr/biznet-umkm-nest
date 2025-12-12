/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Toko` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Toko_slug_key" ON "Toko"("slug");
