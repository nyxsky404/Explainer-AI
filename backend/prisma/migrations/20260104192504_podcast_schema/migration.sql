-- CreateTable
CREATE TABLE `Podcast` (
    `id` VARCHAR(191) NOT NULL,
    `blogUrl` VARCHAR(191) NOT NULL,
    `audioUrl` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
