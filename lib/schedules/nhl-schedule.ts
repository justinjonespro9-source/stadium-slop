/**
 * 2026–27 NHL regular season.
 *
 * `Game.season` is 2026, matching the integer used for every current
 * competition in Stadium Slop. ESPN's season.year for this schedule is 2027
 * (`displayName: "2026-27"`).
 *
 * The regular-season feed is 84 games per club (1,344 games). Preseason and
 * postseason are not included. Global Series, Winter Classic, Stadium Series,
 * and Heritage Classic games that ESPN files as regular season are included
 * and pointed at the building where they are actually played.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  mapArenaScheduleEvents,
  mapArenaScheduleFile,
  type ArenaScheduleLeagueConfig
} from "@/lib/schedules/arena-schedule";
import {
  ESPN_2026_27_SEASON_YEAR,
  type EspnArenaScheduleEvent,
  type EspnArenaScheduleFile
} from "@/lib/schedules/espn-team-schedule";
import {
  resolveNhlHomeVenue,
  resolveNhlVenueSlug
} from "@/lib/schedules/nhl-team-venue-map";

export const NHL_LEAGUE = "NHL" as const;
export const NHL_SEASON = 2026;
export const NHL_ESPN_SEASON_YEAR = ESPN_2026_27_SEASON_YEAR;
export const NHL_REGULAR_SEASON_GAME_COUNT = 1344;

const FIXTURES_PATH = join(process.cwd(), "data/nhl/2026-27-regular-season.json");

export function nhlScheduleFilePath() {
  return FIXTURES_PATH;
}

export function nhlScheduleConfig(): ArenaScheduleLeagueConfig {
  return {
    league: NHL_LEAGUE,
    season: NHL_SEASON,
    externalIdPrefix: "nhl",
    resolveHomeVenue: resolveNhlHomeVenue,
    resolveVenueSlug: resolveNhlVenueSlug
  };
}

export function loadNhlScheduleFile(): EspnArenaScheduleFile {
  const raw = readFileSync(FIXTURES_PATH, "utf8");
  return JSON.parse(raw) as EspnArenaScheduleFile;
}

export function mapNhlScheduleEvents(events: EspnArenaScheduleEvent[]) {
  return mapArenaScheduleEvents(events, nhlScheduleConfig());
}

export function mapNhlScheduleFile(file: EspnArenaScheduleFile = loadNhlScheduleFile()) {
  return mapArenaScheduleFile(file, nhlScheduleConfig());
}

export function loadMappedNhlSchedule() {
  return mapNhlScheduleFile(loadNhlScheduleFile());
}
