/*
  Warnings:

  - Added the required column `nama` to the `PemilikToko` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."User_username_key";

-- AlterTable
ALTER TABLE "public"."PemilikToko" ADD COLUMN     "jabatan" TEXT,
ADD COLUMN     "nama" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Toko" ADD COLUMN     "logo" TEXT;
