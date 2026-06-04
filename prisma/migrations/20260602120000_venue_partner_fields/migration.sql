-- AlterTable
ALTER TABLE "Venue" ADD COLUMN "partnerName" TEXT;
ALTER TABLE "Venue" ADD COLUMN "partnerLogoUrl" TEXT;
ALTER TABLE "Venue" ADD COLUMN "partnerUrl" TEXT;
ALTER TABLE "Venue" ADD COLUMN "partnerCtaText" TEXT;
ALTER TABLE "Venue" ADD COLUMN "ticketsUrl" TEXT;
ALTER TABLE "Venue" ADD COLUMN "teamShopUrl" TEXT;
ALTER TABLE "Venue" ADD COLUMN "xHandle" TEXT;
ALTER TABLE "Venue" ADD COLUMN "instagramHandle" TEXT;
ALTER TABLE "Venue" ADD COLUMN "primaryHashtag" TEXT;
ALTER TABLE "Venue" ADD COLUMN "foundingVenuePartner" BOOLEAN NOT NULL DEFAULT false;
