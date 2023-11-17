-- DropIndex
DROP INDEX `ApiTester_creatorId_fkey` ON `ApiTester`;

-- DropIndex
DROP INDEX `Comment_userId_fkey` ON `Comment`;

-- DropIndex
DROP INDEX `Comment_warningId_fkey` ON `Comment`;

-- DropIndex
DROP INDEX `QrCode_customerId_fkey` ON `QrCode`;

-- DropIndex
DROP INDEX `QrCode_userId_fkey` ON `QrCode`;

-- DropIndex
DROP INDEX `StatusLog_userId_fkey` ON `StatusLog`;

-- DropIndex
DROP INDEX `TestarEvent_apiId_fkey` ON `TestarEvent`;

-- DropIndex
DROP INDEX `TestarEvent_creatorId_fkey` ON `TestarEvent`;

-- DropIndex
DROP INDEX `TesterRequest_apiId_fkey` ON `TesterRequest`;

-- DropIndex
DROP INDEX `TesterRequest_creatorId_fkey` ON `TesterRequest`;

-- DropIndex
DROP INDEX `User_departmentId_fkey` ON `User`;

-- DropIndex
DROP INDEX `Warning_creatorId_fkey` ON `Warning`;

-- AlterTable
ALTER TABLE `ApiTester` MODIFY `description` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `googleToken` TEXT NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusLog` ADD CONSTRAINT `StatusLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QrCode` ADD CONSTRAINT `QrCode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QrCode` ADD CONSTRAINT `QrCode_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Warning` ADD CONSTRAINT `Warning_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_warningId_fkey` FOREIGN KEY (`warningId`) REFERENCES `Warning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApiTester` ADD CONSTRAINT `ApiTester_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TesterRequest` ADD CONSTRAINT `TesterRequest_apiId_fkey` FOREIGN KEY (`apiId`) REFERENCES `ApiTester`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TesterRequest` ADD CONSTRAINT `TesterRequest_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestarEvent` ADD CONSTRAINT `TestarEvent_apiId_fkey` FOREIGN KEY (`apiId`) REFERENCES `ApiTester`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestarEvent` ADD CONSTRAINT `TestarEvent_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_confirmed` ADD CONSTRAINT `_confirmed_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_confirmed` ADD CONSTRAINT `_confirmed_B_fkey` FOREIGN KEY (`B`) REFERENCES `Warning`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RoleToUser` ADD CONSTRAINT `_RoleToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RoleToUser` ADD CONSTRAINT `_RoleToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerToService` ADD CONSTRAINT `_CustomerToService_A_fkey` FOREIGN KEY (`A`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CustomerToService` ADD CONSTRAINT `_CustomerToService_B_fkey` FOREIGN KEY (`B`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
