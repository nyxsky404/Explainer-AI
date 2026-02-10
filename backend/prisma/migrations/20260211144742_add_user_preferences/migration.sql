/*
  Warnings:

  - The values [explainer] on the enum `SummaryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReadingLevel" AS ENUM ('beginner', 'intermediate', 'expert');

-- CreateEnum
CREATE TYPE "Tone" AS ENUM ('casual', 'conversational', 'professional', 'academic');

-- CreateEnum
CREATE TYPE "Depth" AS ENUM ('quick', 'standard', 'detailed');

-- AlterEnum
BEGIN;
CREATE TYPE "SummaryType_new" AS ENUM ('youtube', 'web');
ALTER TABLE "Summary" ALTER COLUMN "type" TYPE "SummaryType_new" USING ("type"::text::"SummaryType_new");
ALTER TYPE "SummaryType" RENAME TO "SummaryType_old";
ALTER TYPE "SummaryType_new" RENAME TO "SummaryType";
DROP TYPE "public"."SummaryType_old";
COMMIT;

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readingLevel" "ReadingLevel" NOT NULL DEFAULT 'intermediate',
    "tone" "Tone" NOT NULL DEFAULT 'conversational',
    "defaultDepth" "Depth" NOT NULL DEFAULT 'standard',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
