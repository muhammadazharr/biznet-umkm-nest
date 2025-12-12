-- CreateEnum
CREATE TYPE "public"."StatusToko" AS ENUM ('aktif', 'nonaktif', 'ditangguhkan');

-- AlterTable
ALTER TABLE "public"."Toko" ADD COLUMN     "status" "public"."StatusToko" NOT NULL DEFAULT 'aktif';
