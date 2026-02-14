-- CreateEnum
CREATE TYPE "ExplainMode" AS ENUM ('EASY', 'INTUITIVE', 'DEEP');

-- CreateTable
CREATE TABLE "DeepExplanation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "mode" "ExplainMode" NOT NULL,
    "content" TEXT NOT NULL,
    "sourceContent" TEXT,
    "followUps" JSONB,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeepExplanation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeepExplanation" ADD CONSTRAINT "DeepExplanation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
