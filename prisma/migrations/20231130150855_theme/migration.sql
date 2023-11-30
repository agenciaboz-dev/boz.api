-- CreateTable
CREATE TABLE `Theme` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `timestamp` TEXT NOT NULL,
    `primary` VARCHAR(191) NOT NULL,
    `secondary` VARCHAR(191) NOT NULL,
    `terciary` VARCHAR(191) NOT NULL,
    `success` VARCHAR(191) NOT NULL,
    `warning` VARCHAR(191) NOT NULL,
    `background_primary` VARCHAR(191) NOT NULL,
    `background_secondary` VARCHAR(191) NOT NULL,
    `text_primary` VARCHAR(191) NOT NULL,
    `text_secondary` VARCHAR(191) NOT NULL,
    `text_terciary` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Theme` ADD CONSTRAINT `Theme_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
