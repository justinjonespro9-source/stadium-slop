/**
 * Import MLS/NWSL venues, teams, vendors, and items from SS_MLS_NWSL_VENUE_ITEMS.docx.
 *
 * Usage:
 *   npm run import:mls-nwsl
 *   npm run import:mls-nwsl -- /path/to/SS_MLS_NWSL_VENUE_ITEMS.docx
 *
 * Merges into existing NFL/MLB shared stadiums (no duplicate venues).
 */
import "dotenv/config";
import { existsSync } from "fs";
import { homedir } from "os";
import { join, resolve } from "path";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { applyMlsNwslImport } from "../lib/apply-mls-nwsl-import";
import { parseMlsNwslDocx } from "../lib/mls-nwsl-docx-parser";

const DEFAULT_DOCX = join(homedir(), "Documents", "SS_MLS_NWSL_VENUE_ITEMS.docx");

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const docxPath = resolve(process.argv[2] ?? DEFAULT_DOCX);

  if (!existsSync(docxPath)) {
    console.error(`DOCX not found: ${docxPath}`);
    process.exit(1);
  }

  console.log(`Parsing ${docxPath}…`);
  const parsed = parseMlsNwslDocx(docxPath);

  console.log(
    `Parsed ${parsed.rows.length} item rows across ${parsed.venueBlocks.length} venue blocks`
  );
  if (parsed.skippedLines.length > 0) {
    console.warn(`Parser warnings: ${parsed.skippedLines.length}`);
    for (const line of parsed.skippedLines.slice(0, 5)) {
      console.warn(`  · ${line}`);
    }
  }

  const stats = await applyMlsNwslImport(prisma, parsed);

  console.log("");
  console.log("MLS/NWSL import summary");
  console.log("-----------------------");
  console.log(`Venues created:      ${stats.venuesCreated}`);
  console.log(`Venues updated:      ${stats.venuesUpdated}`);
  console.log(`Teams attached:      ${stats.teamsAttached}`);
  console.log(`Vendors created:     ${stats.vendorsCreated}`);
  console.log(`Vendors updated:     ${stats.vendorsUpdated}`);
  console.log(`Items created:       ${stats.itemsCreated}`);
  console.log(`Items updated:       ${stats.itemsUpdated}`);
  console.log(`Rows skipped:        ${stats.rowsSkipped}`);
  console.log(`Rows needing review: ${stats.reviewRows}`);

  const teamOnly = parsed.venueBlocks.filter((b) => b.teamOnly);
  if (teamOnly.length > 0) {
    console.log("");
    console.log("Team-only merges (shared stadiums):");
    for (const block of teamOnly) {
      console.log(
        `  · ${block.teams.map((t) => t.name).join(" & ")} → ${block.venueNames.join(" & ") || block.venueSlugs.join(" & ")}`
      );
    }
  }

  if (parsed.reviewRows.length > 0) {
    console.log("");
    console.log("Sample rows flagged for review:");
    for (const row of parsed.reviewRows.slice(0, 8)) {
      console.log(
        `  · ${row.venue} / ${row.item_name} [${row.reviewFlags.join(", ")}]`
      );
    }
    if (parsed.reviewRows.length > 8) {
      console.log(`  … and ${parsed.reviewRows.length - 8} more`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
