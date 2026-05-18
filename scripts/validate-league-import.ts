/**
 * Validate a flat league-import CSV before running import:league.
 * Does not connect to the database or write data.
 *
 * Usage:
 *   npx tsx scripts/validate-league-import.ts ./data/league-import/your-file.csv
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  formatLeagueImportValidationReport,
  validateLeagueImportCsv
} from "../lib/validate-league-import";

function main() {
  const filePath = resolve(
    process.argv[2] ?? "data/league-import/league-import.example.csv"
  );

  let text: string;
  try {
    text = readFileSync(filePath, "utf8");
  } catch {
    console.error(`Could not read file: ${filePath}`);
    process.exit(1);
  }

  const report = validateLeagueImportCsv(text, filePath);
  console.log(formatLeagueImportValidationReport(report));
  console.log("");

  if (!report.safeToImport) {
    console.log(
      "Cleanup recommended before import:league (fix errors above; review warnings)."
    );
    process.exit(1);
  }

  if (report.summary.missingSections > 0 || report.summary.blankCategories > 0) {
    console.log(
      "Import can proceed, but review warnings (sections/categories) for data quality."
    );
  } else {
    console.log("File looks ready for import:league.");
  }
}

main();
