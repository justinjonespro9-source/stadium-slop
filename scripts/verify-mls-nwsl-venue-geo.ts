/**
 * Audit MLS/NWSL venue coordinates, review radius, and timezone resolution.
 *
 * Usage:
 *   npm run verify:mls-nwsl-venue-geo
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { auditMlsNwslVenueGeo } from "../lib/apply-mls-nwsl-venue-geo";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const audit = await auditMlsNwslVenueGeo(prisma);

  console.log("MLS/NWSL venue geo audit");
  console.log("------------------------");
  console.log(`Venues in DB (MLS/NWSL):     ${audit.totalMlsNwslInDb}`);
  console.log(`Registry slugs:             ${audit.rows.filter((r) => r.inRegistry).length}`);
  console.log(`Valid coordinates:        ${audit.withValidCoords}`);
  console.log(`Fully aligned (no issues):  ${audit.matchingRegistry}`);
  console.log(`Rows with issues:         ${audit.withIssues}`);

  const issueRows = audit.rows.filter((r) => r.issues.length > 0);
  if (issueRows.length > 0) {
    console.log("\nIssues:");
    for (const row of issueRows) {
      console.log(`  · ${row.slug}: ${row.issues.join(", ")}`);
      if (row.latitude != null) {
        console.log(
          `      coords (${row.latitude}, ${row.longitude}) · radius ${row.reviewRadiusMeters}m · tz ${row.timeZone} (expected ${row.expectedTimeZone})`
        );
      }
    }
  } else {
    console.log("\nAll registry venues aligned.");
  }

  console.log("\nRegistry venues:");
  for (const row of audit.rows.filter((r) => r.inRegistry)) {
    const status = row.issues.length === 0 ? "OK" : "WARN";
    const coords =
      row.latitude != null
        ? `${row.latitude}, ${row.longitude}`
        : "missing";
    console.log(
      `  ${status} · ${row.slug} · ${coords} · ${row.reviewRadiusMeters ?? "—"}m · ${row.timeZone} · ${row.venueClass ?? "—"}`
    );
  }

  if (issueRows.length > 0) {
    console.log("\nRun: npm run sync:mls-nwsl-venue-geo -- --apply");
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
