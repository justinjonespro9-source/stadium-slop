/**
 * Fetch the ESPN 2026–27 NBA regular season and write
 * data/nba/2026-27-regular-season.json.
 *
 * Usage: npm run fetch:nba-schedule
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { fetchEspnRegularSeasonTeamSchedules } from "../lib/schedules/espn-team-schedule";
import {
  NBA_ESPN_SEASON_YEAR,
  NBA_REGULAR_SEASON_GAME_COUNT,
  NBA_SEASON,
  nbaScheduleFilePath
} from "../lib/schedules/nba-schedule";

async function main() {
  console.log(
    `Fetching ESPN NBA ${NBA_ESPN_SEASON_YEAR} regular season (2026–27)…`
  );
  const { events, duplicateIds } = await fetchEspnRegularSeasonTeamSchedules({
    sportPath: "basketball/nba",
    espnSeasonYear: NBA_ESPN_SEASON_YEAR
  });
  if (events.length !== NBA_REGULAR_SEASON_GAME_COUNT) {
    console.warn(
      `Expected ${NBA_REGULAR_SEASON_GAME_COUNT} games, got ${events.length}`
    );
  }
  if (duplicateIds.length > 0) {
    console.warn(`Collapsed ${duplicateIds.length} duplicate team-schedule rows`);
  }

  const file = {
    league: "NBA" as const,
    season: NBA_SEASON,
    espnSeasonYear: NBA_ESPN_SEASON_YEAR,
    seasonType: "regular" as const,
    source: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{id}/schedule?seasontype=2",
    fetchedAt: new Date().toISOString(),
    events
  };

  const out = nbaScheduleFilePath() || join(process.cwd(), "data/nba/2026-27-regular-season.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  console.log(`Wrote ${events.length} events to ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
