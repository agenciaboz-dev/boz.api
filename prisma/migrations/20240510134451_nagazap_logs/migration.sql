-- AlterTable
ALTER TABLE `Nagazap` ADD COLUMN `failedMessages` TEXT NOT NULL DEFAULT '[]',
    ADD COLUMN `sentMessages` TEXT NOT NULL DEFAULT '[]';
