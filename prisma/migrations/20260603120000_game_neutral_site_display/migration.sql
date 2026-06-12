-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "homeTeamName" TEXT,
ADD COLUMN     "isNeutralSite" BOOLEAN NOT NULL DEFAULT false;

-- Backfill World Cup rows as neutral-site fixtures with preserved home-side display names.
UPDATE "Game" g
SET "isNeutralSite" = true
WHERE g."league" = 'World Cup';
