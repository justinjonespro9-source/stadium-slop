/**
 * Map curated ACC 2026 home fixtures → Prisma Game upsert payloads.
 *
 * TBD kickoff convention (same as Big Ten / SEC / Big 12):
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
  NCAA_ACC_2026_HOME_FIXTURES,
  type AccHomeFixture
} from "@/lib/schedules/ncaa-acc-2026-data";

export const NCAA_FOOTBALL_LEAGUE = "NCAA Football";
export const NCAA_ACC_SEASON = 2026;

export type MappedNcaaAccGame = {
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
export function ncaaAccExternalId(fixture: AccHomeFixture): string {
  const away = awaySlugFromName(fixture.awayTeamName);
  return `ncaa-fb-${NCAA_ACC_SEASON}-${fixture.homeTeamSlug}-${dateKeyFromIsoDate(fixture.date)}-${away}`;
}

export function mapAccFixture(fixture: AccHomeFixture): MappedNcaaAccGame {
  const externalId = ncaaAccExternalId(fixture);
  if (fixture.kickoffTbd || !fixture.kickoffEt) {
    const startsAt = noonEasternOnDate(fixture.date);
    return {
      externalId,
      league: NCAA_FOOTBALL_LEAGUE,
      season: NCAA_ACC_SEASON,
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
    season: NCAA_ACC_SEASON,
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

export function mapAllAcc2026HomeGames(): MappedNcaaAccGame[] {
  return NCAA_ACC_2026_HOME_FIXTURES.map(mapAccFixture);
}

export function ncaaAccMappedGameToPrismaData(
  game: MappedNcaaAccGame,
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
