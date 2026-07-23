/**
 * Apply NBA/NHL/WNBA arena coordinates from registry.
 *
 * Usage:
 *   npm run sync:nba-nhl-venue-geo              # dry-run
 *   npm run sync:nba-nhl-venue-geo -- --apply   # write to database
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { applyNbaNhlVenueGeo } from "../lib/apply-nba-nhl-venue-geo";
import { getNbaNhlVenueGeo, NBA_NHL_VENUE_SLUGS } from "../lib/nba-nhl-venue-geo";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const apply = process.argv.includes("--apply");

async function main() {
  console.log(apply ? "APPLY — NBA/NHL venue geo\n" : "DRY RUN — NBA/NHL venue geo\n");
  console.log("Registry slugs:", NBA_NHL_VENUE_SLUGS.length);
  console.log("");

  for (const slug of NBA_NHL_VENUE_SLUGS) {
    const geo = getNbaNhlVenueGeo(slug)!;
    console.log(
      `  ${slug}: (${geo.latitude}, ${geo.longitude}) · preserve-radius · ${geo.timeZone}`
    );
  }

  const stats = await applyNbaNhlVenueGeo(prisma, apply);

  console.log("");
  console.log(apply ? "Apply summary" : "Would update");
  console.log(`  ${apply ? "Updated" : "To update"}: ${stats.updated}`);
  console.log(`  Already correct: ${stats.skipped}`);
  if (stats.notInDb.length > 0) {
    console.log(`  Not in DB: ${stats.notInDb.join(", ")}`);
  }

  if (!apply && stats.updated > 0) {
    console.log("\nSafe to run: npm run sync:nba-nhl-venue-geo -- --apply");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
