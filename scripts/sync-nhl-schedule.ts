/**
 * Upsert the 2026–27 NHL regular season.
 *
 * Usage:
 *   npm run sync:nhl-schedule
 *   npm run sync:nhl-schedule -- --apply
 *   npm run sync:nhl-schedule -- --live --apply
 *
 * Default: dry-run from data/nhl/2026-27-regular-season.json.
 * Does not delete Game rows. Upserts only `externalId` `nhl-{espnEventId}`.
 * NFL, NBA, MLB, World Cup, and other seasons are not written.
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { fetchEspnRegularSeasonTeamSchedules } from "../lib/schedules/espn-team-schedule";
import {
  loadMappedNhlSchedule,
  mapNhlScheduleEvents,
  NHL_ESPN_SEASON_YEAR,
  NHL_LEAGUE,
  NHL_SEASON
} from "../lib/schedules/nhl-schedule";
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
    ? mapNhlScheduleEvents(
        (
          await fetchEspnRegularSeasonTeamSchedules({
            sportPath: "hockey/nhl",
            espnSeasonYear: NHL_ESPN_SEASON_YEAR
          })
        ).events
      )
    : loadMappedNhlSchedule();

  await runArenaScheduleSync({
    prisma,
    league: NHL_LEAGUE,
    season: NHL_SEASON,
    apply,
    sourceLabel: live
      ? "ESPN live team schedules (regular season)"
      : "data/nhl/2026-27-regular-season.json",
    result
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
