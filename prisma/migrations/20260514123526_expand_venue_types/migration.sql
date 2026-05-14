-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VenueType" ADD VALUE 'TENNIS_CENTER';
ALTER TYPE "VenueType" ADD VALUE 'RACETRACK';
ALTER TYPE "VenueType" ADD VALUE 'GOLF_COURSE';
ALTER TYPE "VenueType" ADD VALUE 'HORSE_TRACK';
ALTER TYPE "VenueType" ADD VALUE 'COLLEGE_STADIUM';
ALTER TYPE "VenueType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "primarySport" TEXT,
ADD COLUMN     "recurringEvents" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "surfaceType" TEXT;
