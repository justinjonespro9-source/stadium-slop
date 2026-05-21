import { GameStatus } from "@prisma/client";

import { getGameDayWindow } from "@/lib/game-day";
import { teamSlugFromImport } from "@/lib/import-slugs";
import {
  resolveHomeVenueByMlbTeamId,
  resolveHomeVenueByTeamName,
  type MlbHomeVenueMapping
} from "@/lib/schedules/mlb-team-venue-map";

const MLB_STATS_SCHEDULE_URL =
  "https://statsapi.mlb.com/api/v1/schedule";

export type MlbScheduleDateRange = {
  startDate: string;
  endDate: string;
};

export type MlbScheduleGameStatus = {
  abstractGameState?: string;
  codedGameState?: string;
  detailedState?: string;
  statusCode?: string;
};

type MlbScheduleTeam = {
  id?: number;
  name?: string;
  abbreviation?: string;
};

type MlbScheduleGame = {
  gamePk: number;
  gameDate: string;
  status?: MlbScheduleGameStatus;
  teams?: {
    home?: { team?: MlbScheduleTeam };
    away?: { team?: MlbScheduleTeam };
  };
  venue?: { id?: number; name?: string };
};

type MlbScheduleResponse = {
  dates?: Array<{
    date?: string;
    games?: MlbScheduleGame[];
  }>;
};

export type MappedMlbScheduleGame = {
  externalId: string;
  gamePk: number;
  league: "MLB";
  season: number;
  homeTeamSlug: string;
  homeTeamName: string;
  awayTeamName: string;
  venueSlug: string;
  startsAt: Date;
  status: GameStatus;
};

export type UnmappedMlbScheduleGame = {
  gamePk: number;
  homeTeamId?: number;
  homeTeamName?: string;
  homeAbbreviation?: string;
  venueName?: string;
  startsAt: string;
  reason: "unknown-home-team" | "unmapped-home-team";
};

export type FetchMlbScheduleResult = {
  mapped: MappedMlbScheduleGame[];
  skipped: UnmappedMlbScheduleGame[];
};

function buildScheduleUrl(range: MlbScheduleDateRange) {
  const params = new URLSearchParams({
    sportId: "1",
    startDate: range.startDate,
    endDate: range.endDate,
    hydrate: "team,venue"
  });
  return `${MLB_STATS_SCHEDULE_URL}?${params.toString()}`;
}

/** Map MLB status fields to Prisma `GameStatus` (defensive / forward-compatible). */
export function mapMlbGameStatusToGameStatus(
  status: MlbScheduleGameStatus | undefined
): GameStatus {
  const abstract = (status?.abstractGameState ?? "").trim().toLowerCase();
  const detailed = (status?.detailedState ?? "").trim().toLowerCase();
  const code = (status?.statusCode ?? "").trim().toLowerCase();

  if (
    detailed.includes("postpon") ||
    code === "ppd" ||
    code === "dr" ||
    abstract.includes("postpon")
  ) {
    return GameStatus.POSTPONED;
  }

  if (
    detailed.includes("cancel") ||
    abstract.includes("cancel") ||
    code === "canc"
  ) {
    return GameStatus.CANCELED;
  }

  if (
    abstract === "final" ||
    detailed.includes("final") ||
    detailed.includes("game over") ||
    code === "f"
  ) {
    return GameStatus.FINAL;
  }

  if (
    abstract === "live" ||
    detailed.includes("in progress") ||
    detailed.includes("in_progress") ||
    detailed.includes("live") ||
    code === "i"
  ) {
    return GameStatus.LIVE;
  }

  if (
    abstract === "preview" ||
    abstract.includes("pre") ||
    detailed.includes("scheduled") ||
    detailed.includes("pre-game") ||
    detailed.includes("pregame") ||
    code === "s" ||
    code === "p"
  ) {
    return GameStatus.SCHEDULED;
  }

  return GameStatus.SCHEDULED;
}

function seasonYearFromGameDate(gameDate: string, fallback: number): number {
  const match = /^(\d{4})-/.exec(gameDate);
  if (match) {
    return Number.parseInt(match[1], 10);
  }
  const year = new Date(gameDate).getUTCFullYear();
  return Number.isFinite(year) ? year : fallback;
}

function resolveHomeMapping(
  homeTeam: MlbScheduleTeam | undefined
): MlbHomeVenueMapping | null {
  if (homeTeam?.id != null) {
    const byId = resolveHomeVenueByMlbTeamId(homeTeam.id);
    if (byId) return byId;
  }
  if (homeTeam?.name) {
    return resolveHomeVenueByTeamName(homeTeam.name);
  }
  return null;
}

export function mapMlbScheduleGames(
  games: MlbScheduleGame[],
  range: MlbScheduleDateRange
): FetchMlbScheduleResult {
  const fallbackSeason = seasonYearFromGameDate(range.startDate, new Date().getFullYear());
  const mapped: MappedMlbScheduleGame[] = [];
  const skipped: UnmappedMlbScheduleGame[] = [];

  for (const game of games) {
    const homeTeam = game.teams?.home?.team;
    const awayTeam = game.teams?.away?.team;
    const homeMapping = resolveHomeMapping(homeTeam);

    if (!homeMapping) {
      skipped.push({
        gamePk: game.gamePk,
        homeTeamId: homeTeam?.id,
        homeTeamName: homeTeam?.name,
        homeAbbreviation: homeTeam?.abbreviation,
        venueName: game.venue?.name,
        startsAt: game.gameDate,
        reason: homeTeam?.id || homeTeam?.name ? "unmapped-home-team" : "unknown-home-team"
      });
      continue;
    }

    const awayName = awayTeam?.name?.trim();
    if (!awayName) {
      skipped.push({
        gamePk: game.gamePk,
        homeTeamId: homeTeam?.id,
        homeTeamName: homeTeam?.name,
        homeAbbreviation: homeTeam?.abbreviation,
        venueName: game.venue?.name,
        startsAt: game.gameDate,
        reason: "unknown-home-team"
      });
      continue;
    }

    mapped.push({
      externalId: `mlb-${game.gamePk}`,
      gamePk: game.gamePk,
      league: "MLB",
      season: seasonYearFromGameDate(game.gameDate, fallbackSeason),
      homeTeamSlug: homeMapping.homeTeamSlug,
      homeTeamName: homeMapping.homeTeamName,
      awayTeamName: awayName,
      venueSlug: homeMapping.venueSlug,
      startsAt: new Date(game.gameDate),
      status: mapMlbGameStatusToGameStatus(game.status)
    });
  }

  return { mapped, skipped };
}

/** Fetch MLB schedule for a date range (free Stats API, no API key). */
export async function fetchMlbSchedule(
  range: MlbScheduleDateRange
): Promise<FetchMlbScheduleResult> {
  const url = buildScheduleUrl(range);
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(
      `MLB Stats API schedule failed (${response.status}): ${url}`
    );
  }

  const payload = (await response.json()) as MlbScheduleResponse;
  const games =
    payload.dates?.flatMap((day) => day.games ?? []) ?? [];

  return mapMlbScheduleGames(games, range);
}

export function mlbMappedGameToPrismaData(
  game: MappedMlbScheduleGame,
  venueId: string
) {
  const window = getGameDayWindow(game.startsAt);
  return {
    league: game.league,
    season: game.season,
    homeTeamSlug: game.homeTeamSlug,
    awayTeamName: game.awayTeamName,
    venueId,
    startsAt: game.startsAt,
    estimatedEndsAt: window.estimatedEndsAt,
    pollingOpensAt: window.pollingOpensAt,
    pollingClosesAt: window.pollingClosesAt,
    status: game.status,
    externalId: game.externalId
  };
}

/** Slug for away team when needed elsewhere (not stored on Game). */
export function awayTeamSlugFromMlbName(teamName: string) {
  return teamSlugFromImport(teamName);
}
