-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,
    `monthlyLimit` INTEGER NOT NULL DEFAULT 10,
    `currentUsage` INTEGER NOT NULL DEFAULT 0,
    `usageResetDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLogin` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Podcast` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `blogUrl` VARCHAR(191) NOT NULL,
    `script` LONGTEXT NULL,
    `audioUrl` VARCHAR(191) NULL,
    `status` ENUM('processing', 'scraping', 'scraped', 'generating_script', 'script_generated', 'generating_audio', 'completed', 'failed') NOT NULL DEFAULT 'processing',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `audioDuration` INTEGER NULL,
    `errorMessage` VARCHAR(191) NULL,
    `failedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Podcast` ADD CONSTRAINT `Podcast_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
