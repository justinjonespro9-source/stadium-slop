/**
 * Fetch the ESPN 2026–27 NHL regular season and write
 * data/nhl/2026-27-regular-season.json.
 *
 * Usage: npm run fetch:nhl-schedule
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { fetchEspnRegularSeasonTeamSchedules } from "../lib/schedules/espn-team-schedule";
import {
  NHL_ESPN_SEASON_YEAR,
  NHL_REGULAR_SEASON_GAME_COUNT,
  NHL_SEASON,
  nhlScheduleFilePath
} from "../lib/schedules/nhl-schedule";

async function main() {
  console.log(
    `Fetching ESPN NHL ${NHL_ESPN_SEASON_YEAR} regular season (2026–27)…`
  );
  const { events, duplicateIds } = await fetchEspnRegularSeasonTeamSchedules({
    sportPath: "hockey/nhl",
    espnSeasonYear: NHL_ESPN_SEASON_YEAR
  });
  if (events.length !== NHL_REGULAR_SEASON_GAME_COUNT) {
    console.warn(
      `Expected ${NHL_REGULAR_SEASON_GAME_COUNT} games, got ${events.length}`
    );
  }
  if (duplicateIds.length > 0) {
    console.warn(`Collapsed ${duplicateIds.length} duplicate team-schedule rows`);
  }

  const file = {
    league: "NHL" as const,
    season: NHL_SEASON,
    espnSeasonYear: NHL_ESPN_SEASON_YEAR,
    seasonType: "regular" as const,
    source: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/{id}/schedule?seasontype=2",
    fetchedAt: new Date().toISOString(),
    events
  };

  const out = nhlScheduleFilePath() || join(process.cwd(), "data/nhl/2026-27-regular-season.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  console.log(`Wrote ${events.length} events to ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
