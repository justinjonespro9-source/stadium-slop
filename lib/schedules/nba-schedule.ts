/**
 * 2026–27 NBA regular season.
 *
 * Stadium Slop stores `Game.season` as an Int. Every current competition in
 * production uses 2026, so these games use 2026 as well. ESPN calls this
 * season year 2027 and displayName "2026-27"; that source year stays on the
 * fetched file and is not written to `Game.season`.
 *
 * ESPN regular season (`seasontype=2`) is 80 games per club (1,200 games),
 * not the older 82-game total. NBA Cup group-play games are inside that set
 * and are imported once, as regular-season games. The Cup championship is not
 * in the regular-season feed and is not added here. Preseason is excluded.
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
  resolveNbaHomeVenue,
  resolveNbaVenueSlug
} from "@/lib/schedules/nba-team-venue-map";

export const NBA_LEAGUE = "NBA" as const;
export const NBA_SEASON = 2026;
export const NBA_ESPN_SEASON_YEAR = ESPN_2026_27_SEASON_YEAR;
export const NBA_REGULAR_SEASON_GAME_COUNT = 1200;
export const NBA_CUP_GROUP_PLAY_NOTE = "NBA Cup - Group Play";

const FIXTURES_PATH = join(process.cwd(), "data/nba/2026-27-regular-season.json");

export function nbaScheduleFilePath() {
  return FIXTURES_PATH;
}

export function nbaScheduleConfig(): ArenaScheduleLeagueConfig {
  return {
    league: NBA_LEAGUE,
    season: NBA_SEASON,
    externalIdPrefix: "nba",
    resolveHomeVenue: resolveNbaHomeVenue,
    resolveVenueSlug: resolveNbaVenueSlug
  };
}

export function loadNbaScheduleFile(): EspnArenaScheduleFile {
  const raw = readFileSync(FIXTURES_PATH, "utf8");
  return JSON.parse(raw) as EspnArenaScheduleFile;
}

export function mapNbaScheduleEvents(events: EspnArenaScheduleEvent[]) {
  return mapArenaScheduleEvents(events, nbaScheduleConfig());
}

export function mapNbaScheduleFile(file: EspnArenaScheduleFile = loadNbaScheduleFile()) {
  return mapArenaScheduleFile(file, nbaScheduleConfig());
}

export function loadMappedNbaSchedule() {
  return mapNbaScheduleFile(loadNbaScheduleFile());
}
