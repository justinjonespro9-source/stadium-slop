-- Optional external social links and review-history visibility (no follow system).
CREATE TYPE "ReviewHistoryVisibility" AS ENUM (
  'HIGHLIGHTS_ONLY',
  'VENUE_CONTEXT_ONLY',
  'PUBLIC',
  'PRIVATE'
);

ALTER TABLE "User"
  ADD COLUMN "instagramUrl" TEXT,
  ADD COLUMN "tiktokUrl" TEXT,
  ADD COLUMN "youtubeUrl" TEXT,
  ADD COLUMN "xUrl" TEXT,
  ADD COLUMN "websiteUrl" TEXT,
  ADD COLUMN "socialLinksPublic" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "reviewHistoryVisibility" "ReviewHistoryVisibility" NOT NULL DEFAULT 'VENUE_CONTEXT_ONLY';
