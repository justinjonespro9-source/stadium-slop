-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('REVIEWER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'ARCHIVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VenueType" AS ENUM ('BALLPARK', 'STADIUM', 'ARENA');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('FOOD', 'NON_ALCOHOLIC_DRINK', 'ALCOHOLIC_DRINK');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('SAVORY', 'SWEET', 'BEVERAGE', 'ALCOHOLIC_BEVERAGE', 'SNACK', 'OTHER');

-- CreateEnum
CREATE TYPE "BeverageStyle" AS ENUM ('BEER', 'COCKTAIL', 'WINE', 'SELTZER', 'NON_ALCOHOLIC', 'OTHER');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'SEASONAL', 'RETIRED', 'FAN_REPORTED', 'VENUE_VERIFIED');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('HALL_OF_FAME_BITE', 'STARTER_EVERY_GAME', 'SOLID_ROLE_PLAYER', 'BENCH_IT', 'SLOP_ALERT');

-- CreateEnum
CREATE TYPE "ValueLabel" AS ENUM ('STEAL', 'FAIR_DEAL', 'STADIUM_TAX', 'OVERPAID', 'ROBBERY');

-- CreateEnum
CREATE TYPE "ServedRightLabel" AS ENUM ('GAME_READY', 'FINE', 'SAT_ON_THE_BENCH', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "LineWaitLabel" AS ENUM ('QUICK_STOP', 'WORTH_THE_WAIT', 'TOO_LONG', 'MISSED_THE_ACTION', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "NapkinLabel" AS ENUM ('CLEAN_WIN', 'SAFE_AT_YOUR_SEAT', 'TWO_HANDED_PROBLEM', 'JERSEY_DANGER', 'FULL_CLEANUP_CREW');

-- CreateEnum
CREATE TYPE "VenueBadge" AS ENUM ('VENUE_MVP', 'FAN_FAVORITE', 'BEST_VALUE', 'WORTH_THE_LINE', 'NEW_THIS_SEASON', 'NAPKIN_NIGHTMARE', 'SLOP_ALERT', 'HIDDEN_GEM', 'MOST_IMPROVED', 'FALLING_FAST');

-- CreateEnum
CREATE TYPE "FreshSignal" AS ENUM ('HOT_TODAY', 'HOLDING_STRONG', 'MIXED_SIGNALS', 'FALLING_FAST', 'FANS_SAY_SKIP', 'COLD_STREAK', 'LINE_TROUBLE');

-- CreateEnum
CREATE TYPE "ConsensusLabel" AS ENUM ('RUN_IT_BACK', 'WORTH_THE_WALK', 'STADIUM_TAX', 'STEAL', 'BENCH_IT');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('FOOD', 'PROFILE', 'MENU_PRICE_PROOF');

-- CreateEnum
CREATE TYPE "PriceReportStatus" AS ENUM ('PENDING', 'APPROVED', 'MERGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SuggestedItemStatus" AS ENUM ('PENDING', 'APPROVED', 'MERGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('REVIEW', 'PHOTO', 'ITEM', 'PRICE_REPORT', 'USER');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('DUPLICATE', 'SUSPICIOUS_ACTIVITY', 'BAD_INTEL', 'INAPPROPRIATE_PHOTO', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "homeVenueId" TEXT,
    "avatarPhotoId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'REVIEWER',
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "helpfulLikesReceived" INTEGER NOT NULL DEFAULT 0,
    "verifiedGameDayReviewCount" INTEGER NOT NULL DEFAULT 0,
    "photoUploadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "leagues" TEXT[],
    "teams" TEXT[],
    "sports" TEXT[],
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "reviewRadiusMeters" INTEGER NOT NULL,
    "venueType" "VenueType" NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "lineIntel" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "customCategoryLabel" TEXT,
    "alcoholic" BOOLEAN NOT NULL DEFAULT false,
    "ageRestricted" BOOLEAN NOT NULL DEFAULT false,
    "beverageStyle" "BeverageStyle",
    "location" TEXT NOT NULL,
    "sections" TEXT[],
    "description" TEXT NOT NULL,
    "basePrice" DECIMAL(8,2),
    "reportedPrice" DECIMAL(8,2),
    "priceLastConfirmedLabel" TEXT,
    "priceReportCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "isPromoted" BOOLEAN NOT NULL DEFAULT false,
    "sponsorName" TEXT,
    "sponsorDisclosure" TEXT,
    "isNewThisSeason" BOOLEAN NOT NULL DEFAULT false,
    "seasonIntroduced" TEXT,
    "availabilityStatus" "AvailabilityStatus",
    "lastConfirmed" TEXT,
    "venueBadge" "VenueBadge",
    "freshWindowLabel" TEXT,
    "freshSignal" "FreshSignal",
    "freshSignalReason" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "gameDayKey" TEXT NOT NULL,
    "slopScore" DECIMAL(3,1) NOT NULL,
    "napkinRating" INTEGER NOT NULL,
    "labels" "ConsensusLabel"[],
    "verifiedGameDay" BOOLEAN NOT NULL DEFAULT false,
    "seasonLabel" TEXT NOT NULL,
    "note" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpfulLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpfulLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodPhoto" (
    "id" TEXT NOT NULL,
    "foodItemId" TEXT,
    "venueId" TEXT,
    "reviewId" TEXT,
    "uploaderUserId" TEXT NOT NULL,
    "photoType" "PhotoType" NOT NULL,
    "url" TEXT,
    "placeholder" TEXT,
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "verifiedOnSite" BOOLEAN NOT NULL DEFAULT false,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceReport" (
    "id" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportedPrice" DECIMAL(8,2) NOT NULL,
    "photoId" TEXT,
    "status" "PriceReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuggestedItem" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "vendorId" TEXT,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ItemCategory",
    "locationHint" TEXT,
    "photoId" TEXT,
    "status" "SuggestedItemStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuggestedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportFlag" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reviewId" TEXT,
    "reason" "ReportReason" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

-- CreateIndex
CREATE INDEX "User_homeVenueId_idx" ON "User"("homeVenueId");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");

-- CreateIndex
CREATE INDEX "Venue_city_state_idx" ON "Venue"("city", "state");

-- CreateIndex
CREATE INDEX "Vendor_venueId_idx" ON "Vendor"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_venueId_slug_key" ON "Vendor"("venueId", "slug");

-- CreateIndex
CREATE INDEX "FoodItem_vendorId_idx" ON "FoodItem"("vendorId");

-- CreateIndex
CREATE INDEX "FoodItem_venueId_itemType_idx" ON "FoodItem"("venueId", "itemType");

-- CreateIndex
CREATE UNIQUE INDEX "FoodItem_venueId_slug_key" ON "FoodItem"("venueId", "slug");

-- CreateIndex
CREATE INDEX "Review_foodItemId_seasonLabel_idx" ON "Review"("foodItemId", "seasonLabel");

-- CreateIndex
CREATE INDEX "Review_foodItemId_verifiedGameDay_createdAt_idx" ON "Review"("foodItemId", "verifiedGameDay", "createdAt");

-- CreateIndex
CREATE INDEX "Review_venueId_idx" ON "Review"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_foodItemId_gameDayKey_key" ON "Review"("userId", "foodItemId", "gameDayKey");

-- CreateIndex
CREATE INDEX "HelpfulLike_reviewId_idx" ON "HelpfulLike"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "HelpfulLike_userId_reviewId_key" ON "HelpfulLike"("userId", "reviewId");

-- CreateIndex
CREATE INDEX "FoodPhoto_foodItemId_idx" ON "FoodPhoto"("foodItemId");

-- CreateIndex
CREATE INDEX "FoodPhoto_reviewId_idx" ON "FoodPhoto"("reviewId");

-- CreateIndex
CREATE INDEX "FoodPhoto_uploaderUserId_idx" ON "FoodPhoto"("uploaderUserId");

-- CreateIndex
CREATE INDEX "PriceReport_foodItemId_status_idx" ON "PriceReport"("foodItemId", "status");

-- CreateIndex
CREATE INDEX "PriceReport_venueId_idx" ON "PriceReport"("venueId");

-- CreateIndex
CREATE INDEX "PriceReport_userId_idx" ON "PriceReport"("userId");

-- CreateIndex
CREATE INDEX "SuggestedItem_venueId_status_idx" ON "SuggestedItem"("venueId", "status");

-- CreateIndex
CREATE INDEX "SuggestedItem_userId_idx" ON "SuggestedItem"("userId");

-- CreateIndex
CREATE INDEX "ReportFlag_targetType_targetId_idx" ON "ReportFlag"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ReportFlag_status_idx" ON "ReportFlag"("status");

-- CreateIndex
CREATE INDEX "ReportFlag_reporterUserId_idx" ON "ReportFlag"("reporterUserId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_homeVenueId_fkey" FOREIGN KEY ("homeVenueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodItem" ADD CONSTRAINT "FoodItem_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodItem" ADD CONSTRAINT "FoodItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpfulLike" ADD CONSTRAINT "HelpfulLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpfulLike" ADD CONSTRAINT "HelpfulLike_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPhoto" ADD CONSTRAINT "FoodPhoto_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPhoto" ADD CONSTRAINT "FoodPhoto_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPhoto" ADD CONSTRAINT "FoodPhoto_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPhoto" ADD CONSTRAINT "FoodPhoto_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceReport" ADD CONSTRAINT "PriceReport_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceReport" ADD CONSTRAINT "PriceReport_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceReport" ADD CONSTRAINT "PriceReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceReport" ADD CONSTRAINT "PriceReport_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "FoodPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestedItem" ADD CONSTRAINT "SuggestedItem_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestedItem" ADD CONSTRAINT "SuggestedItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestedItem" ADD CONSTRAINT "SuggestedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestedItem" ADD CONSTRAINT "SuggestedItem_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "FoodPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportFlag" ADD CONSTRAINT "ReportFlag_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportFlag" ADD CONSTRAINT "ReportFlag_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
