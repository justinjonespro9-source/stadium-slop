/**
 * Audit active venue geolocation and timezone resolution.
 *
 * Usage:
 *   npm run audit:venue-geo
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { auditAllVenueGeo } from "../lib/audit-venue-geo";
import { validateFairVenueRegistry } from "../lib/fair-venue-geo";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const registryCheck = validateFairVenueRegistry();
  if (!registryCheck.ok) {
    console.error("Fair registry validation failed:");
    for (const issue of registryCheck.issues) {
      console.error(`  · ${issue}`);
    }
    process.exit(1);
  }

  const report = await auditAllVenueGeo(prisma);

  console.log("Venue geolocation audit (DRY RUN)");
  console.log("================================");
  console.log(`Active venues audited:        ${report.totalActiveVenues}`);
  console.log(
    `Missing/invalid geo (active): ${report.activeVenuesMissingGeo.length} ` +
      `(${report.activeWithInvalidCoords} invalid coords, ` +
      `${report.activeWithTimezoneIssues} timezone issues)`
  );

  console.log("\nMLS / NWSL");
  console.log("----------");
  console.log(`In DB: ${report.mlsNwsl.totalMlsNwslInDb} · Valid coords: ${report.mlsNwsl.withValidCoords}`);
  console.log(`Aligned: ${report.mlsNwsl.matchingRegistry} · Issues: ${report.mlsNwsl.withIssues}`);

  console.log("\nWorld Cup 2026 hosts");
  console.log("--------------------");
  console.log(`Hosts with issues: ${report.worldCupHostsWithIssues}/${report.worldCupHosts.length}`);
  for (const row of report.worldCupHosts) {
    const status = row.issues.length === 0 ? "OK" : "WARN";
    const coords =
      row.latitude != null ? `${row.latitude}, ${row.longitude}` : "—";
    console.log(
      `  ${status} · ${row.name} (${row.country}) · slug ${row.matchedSlug ?? "—"} · ${coords} · tz ${row.timeZone ?? "—"}`
    );
    if (row.issues.length > 0) {
      console.log(`         issues: ${row.issues.join(", ")}`);
    }
  }

  console.log("\nState Fair Slop venues");
  console.log("----------------------");
  console.log(`In DB: ${report.fair.inDatabase} · Valid coords: ${report.fair.withValidCoords}`);
  console.log(`Aligned: ${report.fair.fullyAligned} · Issues: ${report.fair.withIssues}`);
  for (const row of report.fair.rows) {
    const status = row.issues.length === 0 ? "OK" : "WARN";
    const coords =
      row.latitude != null ? `${row.latitude}, ${row.longitude}` : "—";
    console.log(
      `  ${status} · ${row.slug} · ${coords} · ${row.reviewRadiusMeters ?? "—"}m · tz ${row.timeZone} (expected ${row.expectedTimeZone})`
    );
    if (row.issues.length > 0) {
      console.log(`         issues: ${row.issues.join(", ")}`);
    }
  }

  if (report.activeVenuesMissingGeo.length > 0) {
    console.log("\nOther active venues with geo/timezone issues");
    console.log("---------------------------------------------");
    for (const row of report.activeVenuesMissingGeo) {
      if (report.fair.rows.some((f) => f.slug === row.slug)) continue;
      if (report.mlsNwsl.rows.some((m) => m.slug === row.slug && m.inRegistry)) continue;
      console.log(`  · ${row.slug}: ${row.issues.join(", ")}`);
      console.log(
        `    (${row.latitude}, ${row.longitude}) · tz ${row.timeZone} · expected ${row.expectedTimeZone} via ${row.timeZoneSource}`
      );
    }
  }

  const hasIssues =
    report.activeVenuesMissingGeo.length > 0 ||
    report.fair.withIssues > 0 ||
    report.mlsNwsl.withIssues > 0 ||
    report.worldCupHostsWithIssues > 0;

  if (hasIssues) {
    console.log("\nSuggested fixes:");
    if (report.fair.withIssues > 0) {
      console.log("  npm run sync:fair-venue-geo -- --apply");
      console.log("  npm run ensure:fair-venues -- --apply");
    }
    if (report.mlsNwsl.withIssues > 0) {
      console.log("  npm run sync:mls-nwsl-venue-geo -- --apply");
    }
    if (report.worldCupHostsWithIssues > 0) {
      console.log("  npm run sync:nfl-venue-geo -- --apply  # World Cup NFL host shells at 0,0");
    }
    process.exit(1);
  }

  console.log("\nAll audited venues have valid coordinates and timezone resolution.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
