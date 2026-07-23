import { GameStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getGameDayWindow } from "@/lib/game-day";
import { WORLD_CUP_2026_ARCHIVED } from "@/lib/world-cup-archive";
import { mapSoccerFeedStatusToGameStatus } from "@/lib/schedules/soccer-game-status";
import {
  utcInstantInRange,
  type ScheduleSyncDateRange
} from "@/lib/schedules/schedule-sync-range";
import {
  resolveWorldCupVenueSlug,
  type WorldCupVenueSlug
} from "@/lib/schedules/world-cup-venue-map";
import { buildWorldCup2026Fixtures, type WorldCupFixtureRow } from "@/lib/schedules/world-cup-2026-fixture-seeds";

export const WORLD_CUP_LEAGUE = "World Cup";
export const WORLD_CUP_SEASON = 2026;

export type WorldCupFixturesFile = {
  season: number;
  tournament: string;
  fixtures: WorldCupFixtureRow[];
};

export type MappedWorldCupScheduleGame = {
  externalId: string;
  matchId: string;
  league: typeof WORLD_CUP_LEAGUE;
  season: number;
  stage: string;
  homeTeamSlug: string;
  homeTeamName: string;
  awayTeamName: string;
  venueSlug: WorldCupVenueSlug;
  venueName: string;
  startsAt: Date;
  status: GameStatus;
};

export type UnmappedWorldCupScheduleGame = {
  matchId: string;
  venueName?: string;
  venueSlug?: string;
  startsAt: string;
  reason: "invalid-kickoff" | "unmapped-venue" | "outside-date-range";
};

export type FetchWorldCupScheduleResult = {
  parsed: number;
  mapped: MappedWorldCupScheduleGame[];
  skipped: UnmappedWorldCupScheduleGame[];
};

const FIXTURES_PATH = join(process.cwd(), "data/world-cup/2026-fixtures.json");

export function worldCupFixturesFilePath() {
  return FIXTURES_PATH;
}

export function loadWorldCupFixturesFile(): WorldCupFixturesFile {
  try {
    const raw = readFileSync(FIXTURES_PATH, "utf8");
    return JSON.parse(raw) as WorldCupFixturesFile;
  } catch {
    return buildWorldCup2026Fixtures();
  }
}

/** Slug for `homeTeamSlug` from a team or placeholder label. */
export function worldCupTeamNameToSlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "tbd";
}

function resolveFixtureTeams(fixture: WorldCupFixtureRow): {
  teamOneName: string;
  teamTwoName: string;
} {
  const teamOneName =
    fixture.teamOneName?.trim() ||
    fixture.homeTeamName?.trim() ||
    "TBD";
  const teamTwoName =
    fixture.teamTwoName?.trim() ||
    fixture.awayTeamName?.trim() ||
    "TBD";
  return { teamOneName, teamTwoName };
}

function mapFixtureStatus(raw: WorldCupFixtureRow["status"]): GameStatus {
  if (raw === "SCHEDULED") return GameStatus.SCHEDULED;
  if (raw === "LIVE") return GameStatus.LIVE;
  if (raw === "FINAL") return GameStatus.FINAL;
  if (raw === "POSTPONED") return GameStatus.POSTPONED;
  if (raw === "CANCELED") return GameStatus.CANCELED;
  return mapSoccerFeedStatusToGameStatus(raw);
}

export function mapWorldCupFixtures(
  fixtures: WorldCupFixtureRow[],
  range?: ScheduleSyncDateRange
): FetchWorldCupScheduleResult {
  const mapped: MappedWorldCupScheduleGame[] = [];
  const skipped: UnmappedWorldCupScheduleGame[] = [];

  for (const fixture of fixtures) {
    const startsAt = new Date(fixture.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      skipped.push({
        matchId: fixture.matchId,
        venueName: fixture.venueName,
        venueSlug: fixture.venueSlug,
        startsAt: fixture.startsAt,
        reason: "invalid-kickoff"
      });
      continue;
    }

    if (range && !utcInstantInRange(startsAt.toISOString(), range)) {
      skipped.push({
        matchId: fixture.matchId,
        venueName: fixture.venueName,
        venueSlug: fixture.venueSlug,
        startsAt: fixture.startsAt,
        reason: "outside-date-range"
      });
      continue;
    }

    const venueSlug =
      resolveWorldCupVenueSlug(fixture.venueSlug) ??
      resolveWorldCupVenueSlug(fixture.venueName);
    if (!venueSlug) {
      skipped.push({
        matchId: fixture.matchId,
        venueName: fixture.venueName,
        venueSlug: fixture.venueSlug,
        startsAt: fixture.startsAt,
        reason: "unmapped-venue"
      });
      continue;
    }

    const { teamOneName, teamTwoName } = resolveFixtureTeams(fixture);

    mapped.push({
      externalId: `wc26-${fixture.matchId}`,
      matchId: fixture.matchId,
      league: WORLD_CUP_LEAGUE,
      season: WORLD_CUP_SEASON,
      stage: fixture.stage,
      homeTeamSlug: worldCupTeamNameToSlug(teamOneName),
      homeTeamName: teamOneName,
      awayTeamName: teamTwoName,
      venueSlug,
      venueName: fixture.venueName,
      startsAt,
      status: mapFixtureStatus(fixture.status)
    });
  }

  return {
    parsed: fixtures.length,
    mapped,
    skipped
  };
}

export function fetchWorldCupSchedule(
  range?: ScheduleSyncDateRange
): FetchWorldCupScheduleResult {
  const file = loadWorldCupFixturesFile();
  return mapWorldCupFixtures(file.fixtures, range);
}

export function worldCupMappedGameToPrismaData(
  game: MappedWorldCupScheduleGame,
  venueId: string
) {
  const window = getGameDayWindow(game.startsAt);
  return {
    league: game.league,
    season: game.season,
    homeTeamSlug: game.homeTeamSlug,
    homeTeamName: game.homeTeamName,
    awayTeamName: game.awayTeamName,
    isNeutralSite: true,
    venueId,
    startsAt: game.startsAt,
    estimatedEndsAt: window.estimatedEndsAt,
    pollingOpensAt: window.pollingOpensAt,
    pollingClosesAt: window.pollingClosesAt,
    // Tournament archived: keep rows but never reopen as live/scheduled windows.
    status: WORLD_CUP_2026_ARCHIVED ? GameStatus.FINAL : game.status,
    externalId: game.externalId
  };
}
