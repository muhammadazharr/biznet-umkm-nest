-- CreateEnum
CREATE TYPE "public"."StatusUlasan" AS ENUM ('menunggu', 'terima', 'tolak');

-- AlterTable
ALTER TABLE "public"."Ulasan" ADD COLUMN     "status" "public"."StatusUlasan" NOT NULL DEFAULT 'menunggu';
