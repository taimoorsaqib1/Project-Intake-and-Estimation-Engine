-- CreateEnum
CREATE TYPE "BudgetRange" AS ENUM ('UNDER_5K', 'BETWEEN_5K_15K', 'BETWEEN_15K_50K', 'OVER_50K');

-- CreateEnum
CREATE TYPE "TimelineUrgency" AS ENUM ('ASAP', 'ONE_TO_THREE_MONTHS', 'THREE_TO_SIX_MONTHS', 'SIX_PLUS_MONTHS');

-- CreateEnum
CREATE TYPE "BriefSource" AS ENUM ('FORM', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('WEB_APP', 'MOBILE', 'AI_ML', 'AUTOMATION', 'INTEGRATION');

-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budgetRange" "BudgetRange" NOT NULL,
    "timelineUrgency" "TimelineUrgency" NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "source" "BriefSource" NOT NULL DEFAULT 'FORM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefAnalysis" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "features" JSONB NOT NULL,
    "category" "ProjectCategory",
    "effortMin" INTEGER,
    "effortMax" INTEGER,
    "techStack" JSONB,
    "complexityScore" INTEGER,
    "rawResponse" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BriefAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Brief_createdAt_idx" ON "Brief"("createdAt");

-- CreateIndex
CREATE INDEX "Brief_source_idx" ON "Brief"("source");

-- CreateIndex
CREATE UNIQUE INDEX "BriefAnalysis_briefId_key" ON "BriefAnalysis"("briefId");

-- CreateIndex
CREATE INDEX "BriefAnalysis_briefId_idx" ON "BriefAnalysis"("briefId");

-- CreateIndex
CREATE INDEX "BriefAnalysis_status_idx" ON "BriefAnalysis"("status");

-- AddForeignKey
ALTER TABLE "BriefAnalysis" ADD CONSTRAINT "BriefAnalysis_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
