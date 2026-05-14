-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReportReason" ADD VALUE 'WRONG_ITEM';
ALTER TYPE "ReportReason" ADD VALUE 'SPAM_FAKE';
ALTER TYPE "ReportReason" ADD VALUE 'OFFENSIVE_CONTENT';

-- AlterTable
ALTER TABLE "ReportFlag" ADD COLUMN     "note" TEXT,
ADD COLUMN     "photoId" TEXT;

-- AddForeignKey
ALTER TABLE "ReportFlag" ADD CONSTRAINT "ReportFlag_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "FoodPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
