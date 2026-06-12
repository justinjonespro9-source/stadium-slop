/**
 * Write data/world-cup/2026-fixtures.json from fixture seeds.
 * Usage: npx tsx scripts/build-world-cup-fixtures-json.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { buildWorldCup2026Fixtures } from "../lib/schedules/world-cup-2026-fixture-seeds";

const outDir = join(process.cwd(), "data/world-cup");
mkdirSync(outDir, { recursive: true });

const file = buildWorldCup2026Fixtures();
const outPath = join(outDir, "2026-fixtures.json");
writeFileSync(outPath, `${JSON.stringify(file, null, 2)}\n`, "utf8");

console.log(`Wrote ${file.fixtures.length} fixtures to ${outPath}`);
