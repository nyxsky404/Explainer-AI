-- AlterTable
ALTER TABLE `Podcast` ADD COLUMN `scrapedText` VARCHAR(191) NULL,
    ADD COLUMN `script` VARCHAR(191) NULL,
    MODIFY `audioUrl` VARCHAR(191) NULL;
