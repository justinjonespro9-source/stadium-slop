/**
 * Parse NFL stadium vendor DOCX → flat league-import CSV.
 * Does not run Prisma import.
 *
 * Usage:
 *   npx tsx scripts/parse-nfl-stadium-docx.ts [path-to.docx] [output.csv]
 *
 * Default input: ~/Documents/SS_ NFL Stadiums vender list.docx
 * Default output: data/league-import/nfl-venues-import.cleaned.csv
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

import {
  parseNflStadiumDocx,
  rowsToCsv
} from "../lib/nfl-stadium-docx-parser";

const DEFAULT_INPUT = join(
  homedir(),
  "Documents",
  "SS_ NFL Stadiums vender list.docx"
);
const DEFAULT_OUTPUT = resolve(
  "data/league-import/nfl-venues-import.cleaned.csv"
);

function main() {
  const inputPath = resolve(process.argv[2] ?? DEFAULT_INPUT);
  const outputPath = resolve(process.argv[3] ?? DEFAULT_OUTPUT);

  if (!existsSync(inputPath)) {
    console.error(`DOCX not found: ${inputPath}`);
    process.exit(1);
  }

  const result = parseNflStadiumDocx(inputPath);
  const csvRows = result.rows.map(({ reviewFlags: _rf, ...row }) => row);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, rowsToCsv(csvRows), "utf8");

  const itemCount = csvRows.length;
  const venueCount = result.venues.length;
  const missingSection = csvRows.filter((r) => !(r.section ?? "").trim()).length;
  const reviewCount = result.reviewRows.length + missingSection;

  console.log(`Wrote ${itemCount} rows → ${outputPath}`);
  console.log("");
  console.log("Summary");
  console.log("-------");
  console.log(`Venues parsed: ${venueCount}`);
  console.log(`Food items parsed: ${itemCount}`);
  console.log(
    `Rows needing manual review: ${reviewCount} (${missingSection} missing section, ${result.reviewRows.length} parser flags)`
  );
  console.log("");
  if (result.ambiguousVenues.length > 0) {
    console.log("Ambiguous venues (missing team/city lookup):");
    for (const v of result.ambiguousVenues) {
      console.log(`  - ${v}`);
    }
    console.log("");
  }
  if (result.ambiguousItems.length > 0) {
    console.log("Ambiguous items (sub-lines without vendor context, sample):");
    for (const line of result.ambiguousItems.slice(0, 15)) {
      console.log(`  - ${line}`);
    }
    if (result.ambiguousItems.length > 15) {
      console.log(`  … and ${result.ambiguousItems.length - 15} more`);
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
