-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `locationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `WarehouseLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
