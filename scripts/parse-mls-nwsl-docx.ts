/**
 * Parse MLS/NWSL DOCX → CSV (no database).
 *
 * Usage:
 *   npx tsx scripts/parse-mls-nwsl-docx.ts [path-to.docx] [output.csv]
 */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { homedir } from "os";
import { dirname, join, resolve } from "path";

import { parseMlsNwslDocx, rowsToCsv } from "../lib/mls-nwsl-docx-parser";

const DEFAULT_INPUT = join(homedir(), "Documents", "SS_MLS_NWSL_VENUE_ITEMS.docx");
const DEFAULT_OUTPUT = resolve("data/mls-nwsl/mls-nwsl-venues-import.cleaned.csv");

function main() {
  const inputPath = resolve(process.argv[2] ?? DEFAULT_INPUT);
  const outputPath = resolve(process.argv[3] ?? DEFAULT_OUTPUT);

  if (!existsSync(inputPath)) {
    console.error(`DOCX not found: ${inputPath}`);
    process.exit(1);
  }

  const result = parseMlsNwslDocx(inputPath);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, rowsToCsv(result.rows), "utf8");

  console.log(`Wrote ${result.rows.length} rows → ${outputPath}`);
  console.log(`Venue blocks: ${result.venueBlocks.length}`);
  console.log(`Review rows: ${result.reviewRows.length}`);
}

main();
