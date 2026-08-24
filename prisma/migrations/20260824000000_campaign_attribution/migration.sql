-- CreateEnum
CREATE TYPE "CampaignVisitKind" AS ENUM ('REDIRECT', 'FOLLOW');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "acquisitionCampaignSlug" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN "campaignSlug" TEXT;

-- CreateTable
CREATE TABLE "CampaignVisit" (
    "id" TEXT NOT NULL,
    "campaignSlug" TEXT NOT NULL,
    "kind" "CampaignVisitKind" NOT NULL,
    "destination" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_acquisitionCampaignSlug_idx" ON "User"("acquisitionCampaignSlug");

-- CreateIndex
CREATE INDEX "Review_campaignSlug_idx" ON "Review"("campaignSlug");

-- CreateIndex
CREATE INDEX "CampaignVisit_campaignSlug_createdAt_idx" ON "CampaignVisit"("campaignSlug", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignVisit_campaignSlug_kind_idx" ON "CampaignVisit"("campaignSlug", "kind");
