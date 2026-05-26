/**
 * CLI: Import official venue menu items into Stadium Slop.
 *
 * Usage:
 *   npm run import:venue-menu -- --venue=allianz-field --dry-run
 *   npm run import:venue-menu -- --venue=allianz-field --apply
 */

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { getRegisteredVenueSlugs, getVenueMenuParser } from "../lib/venue-menu-import/registry";
import { applyVenueMenuImport } from "../lib/venue-menu-import/apply";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const args = process.argv.slice(2);
  const venueArg = args.find((a) => a.startsWith("--venue="))?.split("=")[1];
  const isApply = args.includes("--apply");
  const isDryRun = !isApply;

  if (!venueArg) {
    const available = getRegisteredVenueSlugs();
    console.error("Usage: npm run import:venue-menu -- --venue=<slug> [--dry-run|--apply]");
    console.error(`\nAvailable venues: ${available.join(", ") || "(none)"}`);
    process.exit(1);
  }

  const parser = await getVenueMenuParser(venueArg);
  if (!parser) {
    const available = getRegisteredVenueSlugs();
    console.error(`No parser registered for venue "${venueArg}".`);
    console.error(`Available: ${available.join(", ") || "(none)"}`);
    process.exit(1);
  }

  console.log(`\n  Venue Menu Import: ${venueArg}`);
  console.log(`  Mode: ${isDryRun ? "DRY RUN (no changes)" : "APPLY (writing to DB)"}\n`);

  const parseResult = await parser();
  console.log(`  Parsed ${parseResult.items.length} food items (${parseResult.skippedDrinks} drinks skipped)`);
  console.log(`  Source: ${parseResult.sourceUrl}\n`);

  const summary = await applyVenueMenuImport(prisma, parseResult, { dryRun: isDryRun });

  console.log("── Results ──────────────────────────────────────────");
  console.log(`  Added:      ${summary.added}`);
  console.log(`  Matched:    ${summary.matched} (already exist)`);
  console.log(`  Duplicates: ${summary.duplicates}`);
  console.log(`  Skipped:    ${summary.skipped}`);
  console.log("");

  if (summary.rows.length > 0) {
    const maxName = Math.min(
      42,
      Math.max(...summary.rows.map((r) => r.name.length))
    );

    for (const row of summary.rows) {
      const icon =
        row.action === "added"
          ? "+"
          : row.action === "matched"
            ? "="
            : row.action === "duplicate"
              ? "?"
              : "-";
      const tag = row.action.toUpperCase().padEnd(9);
      const name = row.name.padEnd(maxName);
      const vendor = row.vendorName ? `  [${row.vendorName}]` : "";
      const reason = row.reason ? `  -- ${row.reason}` : "";
      const existing = row.existingSlug ? `  (slug: ${row.existingSlug})` : "";
      console.log(`  ${icon} ${tag} ${name}${vendor}${existing}${reason}`);
    }
  }

  console.log("\n─────────────────────────────────────────────────────");
  if (isDryRun) {
    console.log("  This was a dry run. To apply, re-run with --apply.");
  } else {
    console.log(`  Done. ${summary.added} items written to DB.`);
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
