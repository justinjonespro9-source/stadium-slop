/**
 * Map curated Big 12 2026 home fixtures → Prisma Game upsert payloads.
 *
 * TBD kickoff convention (same as Big Ten / SEC):
 * - startsAt = local noon on the game date (display / calendar anchor)
 * - pollingOpensAt === pollingClosesAt so isGameDayActive never opens
 * - status remains SCHEDULED
 */

import { GameStatus } from "@prisma/client";

import { getGameDayWindow } from "@/lib/game-day";
import { teamSlugFromImport } from "@/lib/import-slugs";
import {
  noonEasternOnDate,
  parseEasternKickoff
} from "@/lib/schedules/ncaa-big-ten-schedule";
import {
  NCAA_BIG_12_2026_HOME_FIXTURES,
  type Big12HomeFixture
} from "@/lib/schedules/ncaa-big-12-2026-data";

export const NCAA_FOOTBALL_LEAGUE = "NCAA Football";
export const NCAA_BIG_12_SEASON = 2026;

export type MappedNcaaBig12Game = {
  externalId: string;
  league: typeof NCAA_FOOTBALL_LEAGUE;
  season: number;
  homeTeamSlug: string;
  homeTeamName: string;
  awayTeamName: string;
  venueSlug: string;
  startsAt: Date;
  status: GameStatus;
  kickoffTbd: boolean;
  pollingOpensAt: Date;
  pollingClosesAt: Date;
  estimatedEndsAt: Date;
};

/** YYYYMMDD from YYYY-MM-DD. */
export function dateKeyFromIsoDate(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

export function awaySlugFromName(awayTeamName: string): string {
  return teamSlugFromImport(awayTeamName);
}

/**
 * Deterministic external id:
 * ncaa-fb-2026-{homeTeamSlug}-{YYYYMMDD}-{awaySlug}
 */
export function ncaaBig12ExternalId(fixture: Big12HomeFixture): string {
  const away = awaySlugFromName(fixture.awayTeamName);
  return `ncaa-fb-${NCAA_BIG_12_SEASON}-${fixture.homeTeamSlug}-${dateKeyFromIsoDate(fixture.date)}-${away}`;
}

export function mapBig12Fixture(fixture: Big12HomeFixture): MappedNcaaBig12Game {
  const externalId = ncaaBig12ExternalId(fixture);
  if (fixture.kickoffTbd || !fixture.kickoffEt) {
    const startsAt = noonEasternOnDate(fixture.date);
    return {
      externalId,
      league: NCAA_FOOTBALL_LEAGUE,
      season: NCAA_BIG_12_SEASON,
      homeTeamSlug: fixture.homeTeamSlug,
      homeTeamName: fixture.homeTeamName,
      awayTeamName: fixture.awayTeamName,
      venueSlug: fixture.venueSlug,
      startsAt,
      status: GameStatus.SCHEDULED,
      kickoffTbd: true,
      pollingOpensAt: startsAt,
      pollingClosesAt: startsAt,
      estimatedEndsAt: startsAt
    };
  }

  const startsAt = parseEasternKickoff(fixture.date, fixture.kickoffEt);
  const window = getGameDayWindow(startsAt);
  return {
    externalId,
    league: NCAA_FOOTBALL_LEAGUE,
    season: NCAA_BIG_12_SEASON,
    homeTeamSlug: fixture.homeTeamSlug,
    homeTeamName: fixture.homeTeamName,
    awayTeamName: fixture.awayTeamName,
    venueSlug: fixture.venueSlug,
    startsAt,
    status: GameStatus.SCHEDULED,
    kickoffTbd: false,
    pollingOpensAt: window.pollingOpensAt,
    pollingClosesAt: window.pollingClosesAt,
    estimatedEndsAt: window.estimatedEndsAt
  };
}

export function mapAllBig122026HomeGames(): MappedNcaaBig12Game[] {
  return NCAA_BIG_12_2026_HOME_FIXTURES.map(mapBig12Fixture);
}

export function ncaaBig12MappedGameToPrismaData(
  game: MappedNcaaBig12Game,
  venueId: string
) {
  return {
    league: game.league,
    season: game.season,
    homeTeamSlug: game.homeTeamSlug,
    homeTeamName: game.homeTeamName,
    awayTeamName: game.awayTeamName,
    isNeutralSite: false,
    venueId,
    startsAt: game.startsAt,
    estimatedEndsAt: game.estimatedEndsAt,
    pollingOpensAt: game.pollingOpensAt,
    pollingClosesAt: game.pollingClosesAt,
    status: game.status,
    externalId: game.externalId
  };
}
