-- AlterTable
ALTER TABLE "Review" ADD COLUMN "isTestReview" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Review_foodItemId_isTestReview_status_idx" ON "Review"("foodItemId", "isTestReview", "status");
