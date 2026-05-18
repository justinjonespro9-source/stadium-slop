/**
 * Apply flat league CSV or JSON rows to Postgres (venues → vendors → food items).
 *
 * Usage:
 *   npx tsx scripts/apply-league-import.ts ./data/league-import/league-import.example.csv
 *   npx tsx scripts/apply-league-import.ts ./data/league-import/league-import.example.json
 *
 * Requires DATABASE_URL and migrations applied. Does not import real league data by default.
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";

import { applyLeagueImportRows } from "../lib/apply-league-import";
import {
  parseLeagueImportPayload,
  parseLeagueImportRowsFromCsv
} from "../lib/league-import-shape";
import { prisma } from "../lib/prisma";

async function main() {
  const filePath = resolve(
    process.argv[2] ?? "data/league-import/league-import.example.csv"
  );
  const text = readFileSync(filePath, "utf8");

  const rows =
    filePath.endsWith(".json") || filePath.endsWith(".jsonc")
      ? parseLeagueImportPayload(JSON.parse(text)).rows
      : parseLeagueImportRowsFromCsv(text);

  if (rows.length === 0) {
    console.warn(
      `No importable rows in ${filePath}. Check headers match data/league-import/README.md.`
    );
    process.exit(0);
  }

  const result = await applyLeagueImportRows(prisma, rows);

  console.log(
    `League import OK from ${filePath}: ${rows.length} row(s) parsed → ` +
      `${result.venuesUpserted} venue upserts, ${result.vendorsUpserted} vendor upserts, ` +
      `${result.itemsUpserted} item upserts` +
      (result.rowsSkipped ? `, ${result.rowsSkipped} skipped` : "")
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
