-- AlterTable
ALTER TABLE `Comment` ADD COLUMN `customerId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Warning` ADD COLUMN `customerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Warning` ADD CONSTRAINT `Warning_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
