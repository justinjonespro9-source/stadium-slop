/**
 * Apply state fair venue coordinates and review radius from registry.
 *
 * Usage:
 *   npm run sync:fair-venue-geo              # dry-run
 *   npm run sync:fair-venue-geo -- --apply   # write to database
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { applyFairVenueGeo, auditFairVenueGeo } from "../lib/apply-fair-venue-geo";
import { getFairVenueGeoProfile } from "../lib/fair-venue-geo";
import { FAIR_VENUE_SLUGS } from "../lib/fair-import/venues";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

const apply = process.argv.includes("--apply");

async function printRegistry() {
  console.log("Registry targets:");
  for (const slug of FAIR_VENUE_SLUGS) {
    const profile = getFairVenueGeoProfile(slug)!;
    console.log(
      `  ${slug}: (${profile.latitude}, ${profile.longitude}) · ${profile.reviewRadiusMeters}m · ${profile.timeZone}`
    );
  }
}

async function printCoverage(label: string) {
  const audit = await auditFairVenueGeo(prisma);
  console.log(`${label}`);
  console.log(
    `  In DB: ${audit.inDatabase}/${FAIR_VENUE_SLUGS.length} · Valid coords: ${audit.withValidCoords} · ` +
      `Aligned: ${audit.fullyAligned} · Issues: ${audit.withIssues}`
  );
  return audit;
}

async function main() {
  console.log(apply ? "APPLY — fair venue geo\n" : "DRY RUN — fair venue geo\n");
  await printRegistry();
  console.log("");

  const before = await printCoverage("Before");

  const stats = await applyFairVenueGeo(prisma, apply);

  console.log("");
  console.log(apply ? "Apply summary" : "Would update");
  console.log("---------------");
  console.log(`Venues ${apply ? "updated" : "to update"}: ${stats.updated}`);
  console.log(`Already correct:       ${stats.skipped}`);
  if (stats.notInDb.length > 0) {
    console.log(`Not in DB (run ensure:fair-venues -- --apply first): ${stats.notInDb.join(", ")}`);
  }

  if (apply) {
    console.log("");
    await printCoverage("After");
  } else if (stats.updated > 0 || before.withIssues > 0) {
    console.log("\nSafe to run: npm run sync:fair-venue-geo -- --apply");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
