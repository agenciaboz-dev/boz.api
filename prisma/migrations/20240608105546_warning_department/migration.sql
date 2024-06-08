-- AlterTable
ALTER TABLE `Department` ADD COLUMN `warningId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_warningId_fkey` FOREIGN KEY (`warningId`) REFERENCES `Warning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
