/**
 * Apply authoritative MLS/NWSL venue coordinates and review radius from registry.
 *
 * Usage:
 *   npm run sync:mls-nwsl-venue-geo              # dry-run
 *   npm run sync:mls-nwsl-venue-geo -- --apply   # write to database
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  applyMlsNwslVenueGeo,
  auditMlsNwslVenueGeo
} from "../lib/apply-mls-nwsl-venue-geo";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const apply = process.argv.includes("--apply");

async function printCoverage(label: string) {
  const audit = await auditMlsNwslVenueGeo(prisma);
  console.log(`${label}`);
  console.log(
    `  Valid coords: ${audit.withValidCoords}/${audit.rows.filter((r) => r.inRegistry && r.inDatabase).length} · ` +
      `Fully aligned: ${audit.matchingRegistry} · Issues: ${audit.withIssues}`
  );
  return audit;
}

async function main() {
  console.log(apply ? "APPLY — updating venue geo\n" : "DRY RUN — venue geo\n");

  const before = await printCoverage("Before");

  const stats = await applyMlsNwslVenueGeo(prisma, apply);

  console.log("");
  console.log(apply ? "Apply summary" : "Would update");
  console.log("---------------");
  console.log(`Venues ${apply ? "updated" : "to update"}: ${stats.updated}`);
  console.log(`Already correct:       ${stats.skipped}`);
  if (stats.notInDb.length > 0) {
    console.log(`Not in DB:             ${stats.notInDb.join(", ")}`);
  }

  if (apply) {
    console.log("");
    await printCoverage("After");
  } else if (stats.updated > 0) {
    console.log("\nSafe to run: npm run sync:mls-nwsl-venue-geo -- --apply");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
