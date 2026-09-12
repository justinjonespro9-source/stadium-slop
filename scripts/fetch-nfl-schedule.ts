/**
 * Fetch the ESPN 2026 NFL regular-season scoreboard and write
 * data/nfl/2026-regular-season.json.
 *
 * Usage: npm run fetch:nfl-schedule
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  fetchEspnNflRegularSeason,
  NFL_REGULAR_SEASON_GAME_COUNT
} from "../lib/schedules/nfl-espn";

const OUT = join(process.cwd(), "data/nfl/2026-regular-season.json");

async function main() {
  const season = 2026;
  console.log(`Fetching ESPN NFL ${season} regular season (weeks 1–18)…`);
  const file = await fetchEspnNflRegularSeason(season);
  if (file.events.length !== NFL_REGULAR_SEASON_GAME_COUNT) {
    console.warn(
      `Expected ${NFL_REGULAR_SEASON_GAME_COUNT} games, got ${file.events.length}`
    );
  }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  console.log(`Wrote ${file.events.length} events to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
