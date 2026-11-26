-- CreateTable
CREATE TABLE `site_events` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `path` VARCHAR(300) NOT NULL,
    `source` VARCHAR(40) NOT NULL,
    `referrerHost` VARCHAR(255) NULL,
    `utmSource` VARCHAR(100) NULL,
    `utmMedium` VARCHAR(100) NULL,
    `utmCampaign` VARCHAR(150) NULL,
    `device` VARCHAR(10) NOT NULL,
    `target` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `site_events_createdAt_idx`(`createdAt`),
    INDEX `site_events_type_createdAt_idx`(`type`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promo_products` (
    `id` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `image` LONGTEXT NOT NULL,
    `affiliateUrl` VARCHAR(2048) NOT NULL,
    `price` DOUBLE NULL,
    `oldPrice` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `promo_products_storeId_isActive_idx`(`storeId`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `promo_products` ADD CONSTRAINT `promo_products_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

