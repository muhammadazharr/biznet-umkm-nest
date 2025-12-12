-- CreateTable
CREATE TABLE "public"."SosialMedia" (
    "id" SERIAL NOT NULL,
    "tokoId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SosialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Faq" (
    "id" SERIAL NOT NULL,
    "tokoId" INTEGER NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "jawaban" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SosialMedia" ADD CONSTRAINT "SosialMedia_tokoId_fkey" FOREIGN KEY ("tokoId") REFERENCES "public"."Toko"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Faq" ADD CONSTRAINT "Faq_tokoId_fkey" FOREIGN KEY ("tokoId") REFERENCES "public"."Toko"("id") ON DELETE CASCADE ON UPDATE CASCADE;
