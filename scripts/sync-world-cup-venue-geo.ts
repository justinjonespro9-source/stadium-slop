/**
 * Apply World Cup 2026 host venue geo, time zones, and recurring event metadata.
 *
 * Usage:
 *   npm run sync:world-cup-venue-geo
 *   npm run sync:world-cup-venue-geo -- --apply
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { applyWorldCupVenueGeo } from "../lib/apply-world-cup-venue-geo";
import { WORLD_CUP_VENUE_SLUGS } from "../lib/schedules/world-cup-venue-map";
import { WORLD_CUP_HOST_VENUE_GEO } from "../lib/world-cup-venue-geo";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

const apply = process.argv.includes("--apply");

async function main() {
  console.log(apply ? "APPLY — World Cup venue geo\n" : "DRY RUN — World Cup venue geo\n");

  for (const slug of WORLD_CUP_VENUE_SLUGS) {
    const geo = WORLD_CUP_HOST_VENUE_GEO[slug];
    console.log(
      `  ${slug}: (${geo.latitude}, ${geo.longitude}) · ${geo.reviewRadiusMeters}m · ${geo.timeZone}`
    );
  }

  const stats = await applyWorldCupVenueGeo(prisma, apply);

  console.log("");
  console.log(apply ? "Apply summary" : "Would update");
  console.log(`  ${apply ? "Updated" : "To update"}: ${stats.updated}`);
  console.log(`  Already correct: ${stats.skipped}`);
  if (stats.notInDb.length > 0) {
    console.log(`  Not in DB: ${stats.notInDb.join(", ")}`);
  }

  if (!apply && stats.updated > 0) {
    console.log("\nSafe to run: npm run sync:world-cup-venue-geo -- --apply");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
