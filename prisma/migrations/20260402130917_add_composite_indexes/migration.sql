-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'REVIEWER');

-- CreateEnum
CREATE TYPE "BriefStage" AS ENUM ('NEW', 'UNDER_REVIEW', 'PROPOSAL_SENT', 'WON', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BriefEventType" AS ENUM ('STAGE_CHANGE', 'ASSIGNMENT', 'NOTE_ADDED');

-- AlterTable
ALTER TABLE "Brief" ADD COLUMN     "assigneeId" TEXT,
ADD COLUMN     "stage" "BriefStage" NOT NULL DEFAULT 'NEW';

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'REVIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefEvent" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "BriefEventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BriefEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefNote" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BriefNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateOverride" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "overriddenById" TEXT NOT NULL,
    "effortMin" INTEGER NOT NULL,
    "effortMax" INTEGER NOT NULL,
    "techStack" JSONB NOT NULL,
    "complexityScore" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstimateOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "BriefEvent_briefId_idx" ON "BriefEvent"("briefId");

-- CreateIndex
CREATE INDEX "BriefEvent_createdAt_idx" ON "BriefEvent"("createdAt");

-- CreateIndex
CREATE INDEX "BriefEvent_briefId_type_idx" ON "BriefEvent"("briefId", "type");

-- CreateIndex
CREATE INDEX "BriefEvent_briefId_createdAt_idx" ON "BriefEvent"("briefId", "createdAt");

-- CreateIndex
CREATE INDEX "BriefNote_briefId_idx" ON "BriefNote"("briefId");

-- CreateIndex
CREATE INDEX "BriefNote_parentId_idx" ON "BriefNote"("parentId");

-- CreateIndex
CREATE INDEX "BriefNote_briefId_parentId_idx" ON "BriefNote"("briefId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateOverride_analysisId_key" ON "EstimateOverride"("analysisId");

-- CreateIndex
CREATE INDEX "EstimateOverride_analysisId_idx" ON "EstimateOverride"("analysisId");

-- CreateIndex
CREATE INDEX "Brief_stage_idx" ON "Brief"("stage");

-- CreateIndex
CREATE INDEX "Brief_assigneeId_idx" ON "Brief"("assigneeId");

-- CreateIndex
CREATE INDEX "Brief_stage_assigneeId_idx" ON "Brief"("stage", "assigneeId");

-- CreateIndex
CREATE INDEX "Brief_stage_createdAt_idx" ON "Brief"("stage", "createdAt");

-- AddForeignKey
ALTER TABLE "Brief" ADD CONSTRAINT "Brief_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefEvent" ADD CONSTRAINT "BriefEvent_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefEvent" ADD CONSTRAINT "BriefEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefNote" ADD CONSTRAINT "BriefNote_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefNote" ADD CONSTRAINT "BriefNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefNote" ADD CONSTRAINT "BriefNote_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BriefNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateOverride" ADD CONSTRAINT "EstimateOverride_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "BriefAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateOverride" ADD CONSTRAINT "EstimateOverride_overriddenById_fkey" FOREIGN KEY ("overriddenById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
