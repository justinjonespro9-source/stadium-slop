-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINAL', 'POSTPONED', 'CANCELED');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "distanceFromVenueMeters" INTEGER,
ADD COLUMN     "gameId" TEXT,
ADD COLUMN     "locationVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "homeTeamSlug" TEXT NOT NULL,
    "awayTeamName" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "estimatedEndsAt" TIMESTAMP(3),
    "pollingOpensAt" TIMESTAMP(3) NOT NULL,
    "pollingClosesAt" TIMESTAMP(3) NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'SCHEDULED',
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_externalId_key" ON "Game"("externalId");

-- CreateIndex
CREATE INDEX "Game_venueId_startsAt_idx" ON "Game"("venueId", "startsAt");

-- CreateIndex
CREATE INDEX "Game_venueId_pollingOpensAt_pollingClosesAt_idx" ON "Game"("venueId", "pollingOpensAt", "pollingClosesAt");

-- CreateIndex
CREATE INDEX "Game_status_startsAt_idx" ON "Game"("status", "startsAt");

-- CreateIndex
CREATE INDEX "Review_gameId_idx" ON "Review"("gameId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
