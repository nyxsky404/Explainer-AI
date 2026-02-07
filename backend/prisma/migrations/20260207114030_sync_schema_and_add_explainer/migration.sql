/*
  Warnings:

  - You are about to drop the column `currentUsage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyLimit` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[githubId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SummaryType" AS ENUM ('youtube', 'web', 'explainer');

-- CreateEnum
CREATE TYPE "AudioStatus" AS ENUM ('pending', 'generating', 'completed', 'failed');

-- DropForeignKey
ALTER TABLE "Podcast" DROP CONSTRAINT "Podcast_userId_fkey";

-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "creditsUsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "currentUsage",
DROP COLUMN "monthlyLimit",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "creditLimit" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "creditsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "githubId" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "provider" TEXT DEFAULT 'email',
ADD COLUMN     "verificationToken" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "type" "SummaryType" NOT NULL,
    "content" TEXT NOT NULL,
    "audioUrl" TEXT,
    "audioStatus" "AudioStatus",
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
