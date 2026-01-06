/*
  Warnings:

  - You are about to alter the column `audioDuration` on the `Podcast` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Podcast` MODIFY `audioDuration` DOUBLE NULL;
