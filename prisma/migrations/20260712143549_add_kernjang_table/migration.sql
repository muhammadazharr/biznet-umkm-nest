-- CreateTable
CREATE TABLE `Keranjang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipAdress` VARCHAR(191) NULL,
    `tokenSession` VARCHAR(191) NULL,
    `sessionExpired` DATETIME(3) NULL,
    `tokoId` INTEGER NOT NULL,
    `produkId` INTEGER NOT NULL,
    `totalHarga` INTEGER NOT NULL,
    `quantiti` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Keranjang` ADD CONSTRAINT `Keranjang_tokoId_fkey` FOREIGN KEY (`tokoId`) REFERENCES `Toko`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Keranjang` ADD CONSTRAINT `Keranjang_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
