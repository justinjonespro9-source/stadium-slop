/**
 * Parse NBA arena vendor DOCX → flat league-import CSV.
 * Does not run Prisma import.
 *
 * Usage:
 *   npx tsx scripts/parse-nba-stadium-docx.ts [path-to.docx] [output.csv]
 *
 * Default input: ~/Documents/SS_NBA_VENUES_ITEMS.docx
 * Default output: data/league-import/nba-venues-import.cleaned.csv
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { rowsToCsv } from "../lib/league-docx-common";
import { parseNbaArenaDocx } from "../lib/nba-arena-docx-parser";

const DEFAULT_INPUT = join(homedir(), "Documents", "SS_NBA_VENUES_ITEMS.docx");
const DEFAULT_OUTPUT = resolve(
  "data/league-import/nba-venues-import.cleaned.csv"
);

function main() {
  const inputPath = resolve(process.argv[2] ?? DEFAULT_INPUT);
  const outputPath = resolve(process.argv[3] ?? DEFAULT_OUTPUT);

  if (!existsSync(inputPath)) {
    console.error(`DOCX not found: ${inputPath}`);
    process.exit(1);
  }

  const result = parseNbaArenaDocx(inputPath);
  const csvRows = result.rows.map(({ reviewFlags: _rf, ...row }) => row);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, rowsToCsv(csvRows), "utf8");

  const missingSection = csvRows.filter((r) => !(r.section ?? "").trim()).length;
  const blankCategory = csvRows.filter((r) => !(r.category ?? "").trim()).length;
  const reviewCount = result.reviewRows.length + missingSection;

  console.log(`Wrote ${csvRows.length} rows → ${outputPath}`);
  console.log("");
  console.log("Summary");
  console.log("-------");
  console.log(`Venues parsed: ${result.venues.length}`);
  console.log(`Rows parsed: ${csvRows.length}`);
  console.log(`Rows needing manual review: ${reviewCount}`);
  console.log(`Missing sections: ${missingSection}`);
  console.log(`Blank categories: ${blankCategory}`);
  console.log(`Parser-flagged rows: ${result.reviewRows.length}`);
  console.log("");

  if (result.ambiguousVenues.length > 0) {
    console.log("Ambiguous venues:");
    for (const v of result.ambiguousVenues) {
      console.log(`  - ${v}`);
    }
    console.log("");
  }

  if (result.ambiguousItems.length > 0) {
    console.log("Ambiguous items (sample):");
    for (const line of result.ambiguousItems.slice(0, 12)) {
      console.log(`  - ${line}`);
    }
    if (result.ambiguousItems.length > 12) {
      console.log(`  … and ${result.ambiguousItems.length - 12} more`);
    }
    console.log("");
  }

  const byFlag = new Map<string, number>();
  for (const row of result.reviewRows) {
    for (const flag of row.reviewFlags) {
      byFlag.set(flag, (byFlag.get(flag) ?? 0) + 1);
    }
  }
  if (byFlag.size > 0) {
    console.log("Review flags:");
    for (const [flag, count] of [...byFlag.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${flag}: ${count}`);
    }
  }
}

main();
