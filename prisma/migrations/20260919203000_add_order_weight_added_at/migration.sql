-- Record when transport weight is entered so period revenue uses the business date.
ALTER TABLE `orders` ADD COLUMN `weightAddedAt` DATETIME(3) NULL;

UPDATE `orders`
SET `weightAddedAt` = `updatedAt`
WHERE `weight` IS NOT NULL;

CREATE INDEX `orders_weightAddedAt_idx` ON `orders`(`weightAddedAt`);