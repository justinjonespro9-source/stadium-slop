import { GameStatus } from "@prisma/client";

import { getGameDayWindow } from "@/lib/game-day";
import {
  resolveMlsHomeVenue,
  type SoccerHomeVenueMapping
} from "@/lib/schedules/mls-nwsl-team-venue-map";
import { mapSoccerFeedStatusToGameStatus } from "@/lib/schedules/soccer-game-status";
import {
  listDatesInRange,
  seasonYearFromRange,
  utcInstantInRange,
  type ScheduleSyncDateRange
} from "@/lib/schedules/schedule-sync-range";

/** MLS Stats API — public, no API key (live status; sparse on future dates). */
const MLS_STATS_API_BASE = "https://stats-api.mlssoccer.com";

/**
 * FixtureDownload season bundle — full fixture list (used for 45-day window coverage).
 * https://fixturedownload.com/feed/json/mls-{year}
 */
export function mlsFixtureFeedUrl(seasonYear: number) {
  return `https://fixturedownload.com/feed/json/mls-${seasonYear}`;
}

export type MlsFixtureMatch = {
  MatchNumber: number;
  DateUtc: string;
  Location: string;
  HomeTeam: string;
  AwayTeam: string;
  HomeTeamScore?: number | null;
  AwayTeamScore?: number | null;
};

/** 2026 regular season (update when MLS publishes a new season id). */
export const MLS_STATS_SEASON_ID_BY_YEAR: Record<number, string> = {
  2026: "MLS-SEA-0001KA"
};

export const MLS_REGULAR_SEASON_COMPETITION_ID = "MLS-COM-000001";

export type MlsStatsScheduleMatch = {
  match_id: string;
  season?: number;
  season_id?: string;
  competition_id?: string;
  competition_name?: string;
  competition_type?: string;
  home_team_name?: string;
  away_team_name?: string;
  stadium_name?: string;
  planned_kickoff_time?: string;
  match_status?: string;
  match_date_time_status?: string;
  home_team_goals?: number;
  away_team_goals?: number;
};

type MlsStatsScheduleDayResponse = {
  schedule?: MlsStatsScheduleMatch[];
};

export type MappedMlsScheduleGame = {
  externalId: string;
  matchId: string;
  league: "MLS";
  season: number;
  homeTeamSlug: string;
  homeTeamName: string;
  awayTeamName: string;
  venueSlug: string;
  startsAt: Date;
  status: GameStatus;
};

export type UnmappedMlsScheduleGame = {
  matchId: string;
  homeTeamName?: string;
  awayTeamName?: string;
  stadiumName?: string;
  startsAt: string;
  reason: "unknown-home-team" | "unmapped-home-team" | "unmapped-stadium" | "missing-away-team";
};

export type FetchMlsScheduleResult = {
  mapped: MappedMlsScheduleGame[];
  skipped: UnmappedMlsScheduleGame[];
};

function mlsSeasonIdForYear(year: number): string {
  return MLS_STATS_SEASON_ID_BY_YEAR[year] ?? MLS_STATS_SEASON_ID_BY_YEAR[2026]!;
}

function buildDayScheduleUrl(seasonId: string, matchDate: string) {
  const params = new URLSearchParams({ match_date: matchDate });
  return `${MLS_STATS_API_BASE}/matches/seasons/${seasonId}?${params.toString()}`;
}

export function mapMlsStatsMatchStatus(match: MlsStatsScheduleMatch): GameStatus {
  const hasFinalScore =
    match.match_status?.toLowerCase().includes("final") ||
    match.match_status?.toLowerCase().includes("whistle") ||
    (typeof match.home_team_goals === "number" &&
      typeof match.away_team_goals === "number" &&
      match.match_status?.toLowerCase() !== "scheduled");

  return mapSoccerFeedStatusToGameStatus(
    match.match_status ?? match.match_date_time_status,
    { hasFinalScore }
  );
}

function isMlsRegularSeasonMatch(match: MlsStatsScheduleMatch): boolean {
  if (match.competition_id === MLS_REGULAR_SEASON_COMPETITION_ID) {
    return true;
  }
  const name = (match.competition_name ?? "").toLowerCase();
  return (
    name.includes("major league soccer") &&
    name.includes("regular season") &&
    !name.includes("next pro")
  );
}

export function mapMlsScheduleMatches(
  matches: MlsStatsScheduleMatch[],
  range: ScheduleSyncDateRange
): FetchMlsScheduleResult {
  const season = seasonYearFromRange(range);
  const mapped: MappedMlsScheduleGame[] = [];
  const skipped: UnmappedMlsScheduleGame[] = [];

  for (const match of matches) {
    if (!isMlsRegularSeasonMatch(match)) {
      continue;
    }

    const homeTeamName = match.home_team_name?.trim();
    const awayTeamName = match.away_team_name?.trim();
    const kickoff = match.planned_kickoff_time?.trim();

    if (!homeTeamName || !kickoff) {
      skipped.push({
        matchId: match.match_id,
        homeTeamName,
        awayTeamName,
        stadiumName: match.stadium_name,
        startsAt: kickoff ?? "",
        reason: "unknown-home-team"
      });
      continue;
    }

    if (!awayTeamName) {
      skipped.push({
        matchId: match.match_id,
        homeTeamName,
        stadiumName: match.stadium_name,
        startsAt: kickoff,
        reason: "missing-away-team"
      });
      continue;
    }

    const homeMapping: SoccerHomeVenueMapping | null = resolveMlsHomeVenue({
      homeTeamName,
      stadiumName: match.stadium_name
    });

    if (!homeMapping) {
      skipped.push({
        matchId: match.match_id,
        homeTeamName,
        awayTeamName,
        stadiumName: match.stadium_name,
        startsAt: kickoff,
        reason: match.stadium_name ? "unmapped-stadium" : "unmapped-home-team"
      });
      continue;
    }

    mapped.push({
      externalId: `mls-${match.match_id}`,
      matchId: match.match_id,
      league: "MLS",
      season: match.season ?? season,
      homeTeamSlug: homeMapping.homeTeamSlug,
      homeTeamName: homeMapping.homeTeamName,
      awayTeamName,
      venueSlug: homeMapping.venueSlug,
      startsAt: new Date(kickoff),
      status: mapMlsStatsMatchStatus(match)
    });
  }

  return { mapped, skipped };
}

async function fetchMlsScheduleDay(
  seasonId: string,
  matchDate: string
): Promise<MlsStatsScheduleMatch[]> {
  const url = buildDayScheduleUrl(seasonId, matchDate);
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`MLS Stats API schedule failed (${response.status}): ${url}`);
  }

  const payload = (await response.json()) as MlsStatsScheduleDayResponse;
  return payload.schedule ?? [];
}

export function mapMlsFixtureMatches(
  matches: MlsFixtureMatch[],
  range: ScheduleSyncDateRange
): FetchMlsScheduleResult {
  const season = seasonYearFromRange(range);
  const mapped: MappedMlsScheduleGame[] = [];
  const skipped: UnmappedMlsScheduleGame[] = [];

  for (const match of matches) {
    const kickoffRaw = match.DateUtc?.trim();
    if (!kickoffRaw) continue;

    const startsAt = new Date(kickoffRaw.replace(" ", "T"));
    if (Number.isNaN(startsAt.getTime())) continue;
    if (!utcInstantInRange(startsAt.toISOString(), range)) continue;

    const homeTeamName = match.HomeTeam?.trim();
    const awayTeamName = match.AwayTeam?.trim();
    const stadiumName = match.Location?.trim();

    if (!homeTeamName || !awayTeamName) {
      skipped.push({
        matchId: `fx-${match.MatchNumber}`,
        homeTeamName,
        awayTeamName,
        stadiumName,
        startsAt: kickoffRaw,
        reason: !homeTeamName ? "unknown-home-team" : "missing-away-team"
      });
      continue;
    }

    if (
      stadiumName === "TBC" ||
      stadiumName === "TBA" ||
      stadiumName?.includes("Levi's Stadium") ||
      stadiumName?.includes("M&T Bank") ||
      stadiumName?.includes("Stanford Stadium") ||
      stadiumName?.includes("Los Angeles Memorial Coliseum")
    ) {
      skipped.push({
        matchId: `fx-${match.MatchNumber}`,
        homeTeamName,
        awayTeamName,
        stadiumName,
        startsAt: kickoffRaw,
        reason: "unmapped-stadium"
      });
      continue;
    }

    const homeMapping = resolveMlsHomeVenue({ homeTeamName, stadiumName });
    if (!homeMapping) {
      skipped.push({
        matchId: `fx-${match.MatchNumber}`,
        homeTeamName,
        awayTeamName,
        stadiumName,
        startsAt: kickoffRaw,
        reason: "unmapped-home-team"
      });
      continue;
    }

    const hasFinalScore =
      match.HomeTeamScore != null &&
      match.AwayTeamScore != null &&
      Number.isFinite(match.HomeTeamScore) &&
      Number.isFinite(match.AwayTeamScore);

    mapped.push({
      externalId: `mls-${season}-m${match.MatchNumber}`,
      matchId: `fx-${match.MatchNumber}`,
      league: "MLS",
      season,
      homeTeamSlug: homeMapping.homeTeamSlug,
      homeTeamName: homeMapping.homeTeamName,
      awayTeamName,
      venueSlug: homeMapping.venueSlug,
      startsAt,
      status: mapSoccerFeedStatusToGameStatus(undefined, { hasFinalScore })
    });
  }

  return { mapped, skipped };
}

async function fetchMlsFixtureFeed(
  range: ScheduleSyncDateRange
): Promise<FetchMlsScheduleResult> {
  const seasonYear = seasonYearFromRange(range);
  const url = mlsFixtureFeedUrl(seasonYear);
  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`MLS fixture feed failed (${response.status}): ${url}`);
  }

  const payload = (await response.json()) as MlsFixtureMatch[];
  return mapMlsFixtureMatches(payload, range);
}

function mlsScheduleMergeKey(game: MappedMlsScheduleGame) {
  return `${game.venueSlug}|${game.homeTeamSlug}|${game.startsAt.toISOString().slice(0, 13)}`;
}

function mergeMlsScheduleResults(
  fixture: FetchMlsScheduleResult,
  stats: FetchMlsScheduleResult
): FetchMlsScheduleResult {
  const byKey = new Map<string, MappedMlsScheduleGame>();

  for (const game of fixture.mapped) {
    byKey.set(mlsScheduleMergeKey(game), game);
  }

  for (const game of stats.mapped) {
    const key = mlsScheduleMergeKey(game);
    const existing = byKey.get(key);
    if (existing) {
      byKey.set(key, {
        ...existing,
        status: game.status,
        externalId: game.externalId,
        matchId: game.matchId
      });
    } else {
      byKey.set(key, game);
    }
  }

  return {
    mapped: [...byKey.values()],
    skipped: [...fixture.skipped, ...stats.skipped]
  };
}

/** Fetch MLS regular-season home games across an inclusive local date range. */
export async function fetchMlsSchedule(
  range: ScheduleSyncDateRange
): Promise<FetchMlsScheduleResult> {
  const seasonYear = seasonYearFromRange(range);
  const seasonId = mlsSeasonIdForYear(seasonYear);
  const dates = listDatesInRange(range);

  const [fixture, statsMatches] = await Promise.all([
    fetchMlsFixtureFeed(range),
    (async () => {
      const allMatches: MlsStatsScheduleMatch[] = [];
      for (const matchDate of dates) {
        const dayMatches = await fetchMlsScheduleDay(seasonId, matchDate);
        allMatches.push(...dayMatches);
      }
      return mapMlsScheduleMatches(allMatches, range);
    })()
  ]);

  return mergeMlsScheduleResults(fixture, statsMatches);
}

export function mlsMappedGameToPrismaData(
  game: MappedMlsScheduleGame,
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
