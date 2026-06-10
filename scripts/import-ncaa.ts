/**
 * Import NCAA venues, teams, vendors, and menu items from structured JSON.
 *
 * Usage:
 *   npm run import:ncaa -- --dry-run
 *   npm run import:ncaa -- --apply
 *   npm run import:ncaa -- --apply ./data/ncaa/custom-pack.json
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { applyNcaaImport } from "../lib/apply-ncaa-import";
import { parseNcaaImportPayload } from "../lib/ncaa-import-shape";

const DEFAULT_JSON = resolve("data/ncaa/ncaa-venues.json");

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

function parseArgs(argv: string[]): { dryRun: boolean; jsonPath: string } {
  const flags = argv.filter((a) => a.startsWith("--"));
  const paths = argv.filter((a) => !a.startsWith("--"));
  const dryRun = !flags.includes("--apply");
  const jsonPath = resolve(paths[0] ?? DEFAULT_JSON);
  return { dryRun, jsonPath };
}

function printReport(
  preview: Awaited<ReturnType<typeof applyNcaaImport>>,
  jsonPath: string
) {
  const { stats } = preview;
  console.log(`\n  NCAA Import: ${jsonPath}`);
  console.log(`  Mode: ${preview.dryRun ? "DRY RUN (no changes)" : "APPLY (writing to DB)"}\n`);

  console.log("── Summary ──────────────────────────────────────────");
  console.log(`  Venues parsed:     ${preview.venueSlugs.length}`);
  console.log(`  Venues created:    ${stats.venuesCreated}`);
  console.log(`  Venues updated:    ${stats.venuesUpdated}`);
  console.log(`  Teams attached:    ${stats.teamsAttached}`);
  console.log(`  Items created:     ${stats.itemsCreated}`);
  console.log(`  Items updated:     ${stats.itemsUpdated}`);
  console.log(`  Items skipped:     ${stats.itemsSkipped}`);
  console.log(`  Total item rows:   ${preview.totalItems}`);

  if (Object.keys(stats.skippedByReason).length > 0) {
    console.log("\n── Skipped items ────────────────────────────────────");
    for (const [reason, count] of Object.entries(stats.skippedByReason).sort()) {
      console.log(`  ${reason.padEnd(20)} ${count}`);
    }
  }

  console.log("\n── By sport ─────────────────────────────────────────");
  for (const [sport, row] of Object.entries(stats.bySport).sort()) {
    console.log(
      `  ${sport.padEnd(14)} venues: ${String(row.venues).padStart(2)}   items: ${row.items}`
    );
  }

  console.log("\n── By venue ─────────────────────────────────────────");
  for (const slug of preview.venueSlugs) {
    const row = stats.byVenue[slug] ?? { items: 0, sport: "?" };
    console.log(`  ${slug.padEnd(28)} ${row.sport.padEnd(12)} ${row.items} items`);
  }

  console.log("\n─────────────────────────────────────────────────────");
  if (preview.dryRun) {
    console.log("  This was a dry run. Re-run with --apply to write.\n");
  } else {
    console.log("  Done.\n");
  }
}

async function main() {
  const { dryRun, jsonPath } = parseArgs(process.argv.slice(2));
  const text = readFileSync(jsonPath, "utf8");
  const payload = parseNcaaImportPayload(JSON.parse(text));

  const preview = await applyNcaaImport(prisma, payload, { dryRun });
  printReport(preview, jsonPath);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
