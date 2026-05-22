/**
 * Dev-only Slop Scorecard fixtures (3 cards on one MLB item).
 *
 * Usage:
 *   npm run seed:demo-scorecards
 *
 * Optional env:
 *   DEMO_SCORECARD_VENUE_SLUG=target-field
 *   DEMO_SCORECARD_FOOD_SLUG=la-madre-street-elote
 *   ENABLE_DEMO_SCORECARDS=true   (required to run in production)
 */

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { applyDemoScorecardsSeed } from "@/lib/apply-demo-scorecards-seed";
import {
  assertDevDemoScorecardsAllowed,
  demoScorecardItemPath
} from "@/lib/dev-demo-scorecards";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  assertDevDemoScorecardsAllowed("seed:demo-scorecards");

  const result = await applyDemoScorecardsSeed(prisma);

  if (result.skipped) {
    console.error(`[seed:demo-scorecards] ${result.skipReason ?? "Skipped"}`);
    process.exit(1);
  }

  const path = demoScorecardItemPath(result.venueSlug, result.foodSlug);
  console.log(
    [
      `[seed:demo-scorecards] Upserted ${result.reviewsUpserted} reviews, ${result.photosUpserted} photos, ${result.helpfulUpserted} helpful likes.`,
      `Target: ${result.venueSlug} / ${result.foodSlug}`,
      `View locally: http://127.0.0.1:3000${path}`,
      `Dev hub: http://127.0.0.1:3000/dev/demo-scorecards`,
      "No game-day window required — browse the item page while signed out."
    ].join("\n")
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
