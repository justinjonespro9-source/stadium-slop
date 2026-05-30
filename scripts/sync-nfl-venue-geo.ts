/**
 * Apply NFL / shared-stadium venue coordinates from registry (incl. several World Cup 2026 hosts).
 *
 * Usage:
 *   npm run sync:nfl-venue-geo              # dry-run
 *   npm run sync:nfl-venue-geo -- --apply   # write to database
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { applyNflVenueGeo, NFL_VENUE_SLUGS } from "../lib/apply-nfl-venue-geo";
import { getNflVenueGeo } from "../lib/nfl-venue-geo";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const apply = process.argv.includes("--apply");

async function main() {
  console.log(apply ? "APPLY — NFL venue geo\n" : "DRY RUN — NFL venue geo\n");
  console.log("Registry slugs:", NFL_VENUE_SLUGS.join(", "));
  console.log("");

  for (const slug of NFL_VENUE_SLUGS) {
    const geo = getNflVenueGeo(slug)!;
    console.log(
      `  ${slug}: (${geo.latitude}, ${geo.longitude}) · ${geo.reviewRadiusMeters}m · ${geo.timeZone}`
    );
  }

  const stats = await applyNflVenueGeo(prisma, apply);

  console.log("");
  console.log(apply ? "Apply summary" : "Would update");
  console.log(`  ${apply ? "Updated" : "To update"}: ${stats.updated}`);
  console.log(`  Already correct: ${stats.skipped}`);
  if (stats.notInDb.length > 0) {
    console.log(`  Not in DB: ${stats.notInDb.join(", ")}`);
  }

  if (!apply && stats.updated > 0) {
    console.log("\nSafe to run: npm run sync:nfl-venue-geo -- --apply");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
