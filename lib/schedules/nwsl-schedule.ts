import { GameStatus } from "@prisma/client";

import { getGameDayWindow } from "@/lib/game-day";
import {
  resolveNwslHomeVenue,
  type SoccerHomeVenueMapping
} from "@/lib/schedules/mls-nwsl-team-venue-map";
import { mapSoccerFeedStatusToGameStatus } from "@/lib/schedules/soccer-game-status";
import {
  seasonYearFromRange,
  utcInstantInRange,
  type ScheduleSyncDateRange
} from "@/lib/schedules/schedule-sync-range";

/**
 * FixtureDownload NWSL feed (free JSON, season bundle).
 * https://fixturedownload.com/feed/json/nwsl-{year}
 */
export function nwslFixtureFeedUrl(seasonYear: number) {
  return `https://fixturedownload.com/feed/json/nwsl-${seasonYear}`;
}

export type NwslFixtureMatch = {
  MatchNumber: number;
  RoundNumber?: number;
  DateUtc: string;
  Location: string;
  HomeTeam: string;
  AwayTeam: string;
  Group?: string | null;
  HomeTeamScore?: number | null;
  AwayTeamScore?: number | null;
};

export type MappedNwslScheduleGame = {
  externalId: string;
  matchNumber: number;
  league: "NWSL";
  season: number;
  homeTeamSlug: string;
  homeTeamName: string;
  awayTeamName: string;
  venueSlug: string;
  startsAt: Date;
  status: GameStatus;
};

export type UnmappedNwslScheduleGame = {
  matchNumber: number;
  homeTeamName?: string;
  awayTeamName?: string;
  stadiumName?: string;
  startsAt: string;
  reason: "unknown-home-team" | "unmapped-home-team" | "unmapped-stadium" | "missing-away-team";
};

export type FetchNwslScheduleResult = {
  mapped: MappedNwslScheduleGame[];
  skipped: UnmappedNwslScheduleGame[];
};

export function mapNwslFixtureStatus(match: NwslFixtureMatch): GameStatus {
  const hasFinalScore =
    match.HomeTeamScore != null &&
    match.AwayTeamScore != null &&
    Number.isFinite(match.HomeTeamScore) &&
    Number.isFinite(match.AwayTeamScore);

  return mapSoccerFeedStatusToGameStatus(undefined, { hasFinalScore });
}

export function mapNwslScheduleMatches(
  matches: NwslFixtureMatch[],
  range: ScheduleSyncDateRange
): FetchNwslScheduleResult {
  const season = seasonYearFromRange(range);
  const mapped: MappedNwslScheduleGame[] = [];
  const skipped: UnmappedNwslScheduleGame[] = [];

  for (const match of matches) {
    const kickoffRaw = match.DateUtc?.trim();
    if (!kickoffRaw) continue;

    const startsAt = new Date(kickoffRaw.replace(" ", "T"));
    if (Number.isNaN(startsAt.getTime())) continue;
    if (!utcInstantInRange(startsAt.toISOString(), range)) continue;

    const homeTeamName = match.HomeTeam?.trim();
    const awayTeamName = match.AwayTeam?.trim();
    const stadiumName = match.Location?.trim();

    if (!homeTeamName) {
      skipped.push({
        matchNumber: match.MatchNumber,
        awayTeamName,
        stadiumName,
        startsAt: kickoffRaw,
        reason: "unknown-home-team"
      });
      continue;
    }

    if (!awayTeamName) {
      skipped.push({
        matchNumber: match.MatchNumber,
        homeTeamName,
        stadiumName,
        startsAt: kickoffRaw,
        reason: "missing-away-team"
      });
      continue;
    }

    const homeMapping = resolveNwslHomeVenue({
      homeTeamName,
      stadiumName:
        stadiumName && stadiumName.toUpperCase() !== "TBA" ? stadiumName : undefined
    });

    if (!homeMapping) {
      skipped.push({
        matchNumber: match.MatchNumber,
        homeTeamName,
        awayTeamName,
        stadiumName,
        startsAt: kickoffRaw,
        reason:
          stadiumName && stadiumName.toUpperCase() !== "TBA"
            ? "unmapped-stadium"
            : "unmapped-home-team"
      });
      continue;
    }

    pushMapped(mapped, match, season, homeMapping, awayTeamName, startsAt);
  }

  return { mapped, skipped };
}

function pushMapped(
  mapped: MappedNwslScheduleGame[],
  match: NwslFixtureMatch,
  season: number,
  homeMapping: SoccerHomeVenueMapping,
  awayTeamName: string,
  startsAt: Date
) {
  mapped.push({
    externalId: `nwsl-${season}-m${match.MatchNumber}`,
    matchNumber: match.MatchNumber,
    league: "NWSL",
    season,
    homeTeamSlug: homeMapping.homeTeamSlug,
    homeTeamName: homeMapping.homeTeamName,
    awayTeamName,
    venueSlug: homeMapping.venueSlug,
    startsAt,
    status: mapNwslFixtureStatus(match)
  });
}

export async function fetchNwslSchedule(
  range: ScheduleSyncDateRange
): Promise<FetchNwslScheduleResult> {
  const seasonYear = seasonYearFromRange(range);
  const url = nwslFixtureFeedUrl(seasonYear);
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`NWSL fixture feed failed (${response.status}): ${url}`);
  }

  const payload = (await response.json()) as NwslFixtureMatch[];
  return mapNwslScheduleMatches(payload, range);
}

export function nwslMappedGameToPrismaData(
  game: MappedNwslScheduleGame,
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
