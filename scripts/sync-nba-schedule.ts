/**
 * Upsert the 2026–27 NBA regular season.
 *
 * Usage:
 *   npm run sync:nba-schedule
 *   npm run sync:nba-schedule -- --apply
 *   npm run sync:nba-schedule -- --live --apply
 *
 * Default: dry-run from data/nba/2026-27-regular-season.json.
 * `--live` refetches ESPN regular-season team schedules, then maps the same way.
 *
 * Does not delete Game rows. Upserts only `externalId` `nba-{espnEventId}`.
 * NFL, NHL, MLB, World Cup, and other seasons are not read for writes.
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { fetchEspnRegularSeasonTeamSchedules } from "../lib/schedules/espn-team-schedule";
import {
  loadMappedNbaSchedule,
  mapNbaScheduleEvents,
  NBA_ESPN_SEASON_YEAR,
  NBA_LEAGUE,
  NBA_SEASON
} from "../lib/schedules/nba-schedule";
import { runArenaScheduleSync } from "../lib/schedules/run-arena-schedule-sync";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stadium_slop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString)
});

async function main() {
  const apply = process.argv.includes("--apply");
  const live = process.argv.includes("--live");
  const result = live
    ? mapNbaScheduleEvents(
        (
          await fetchEspnRegularSeasonTeamSchedules({
            sportPath: "basketball/nba",
            espnSeasonYear: NBA_ESPN_SEASON_YEAR
          })
        ).events
      )
    : loadMappedNbaSchedule();

  await runArenaScheduleSync({
    prisma,
    league: NBA_LEAGUE,
    season: NBA_SEASON,
    apply,
    sourceLabel: live
      ? "ESPN live team schedules (regular season)"
      : "data/nba/2026-27-regular-season.json",
    result
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
