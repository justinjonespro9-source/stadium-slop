/**
 * Map curated Big Ten 2026 home fixtures → Prisma Game upsert payloads.
 *
 * TBD kickoff convention:
 * - startsAt = local noon on the game date (display / calendar anchor)
 * - pollingOpensAt === pollingClosesAt so isGameDayActive never opens
 * - status remains SCHEDULED
 *
 * Known kickoffs: ESPN Eastern times → UTC via America/New_York, then
 * getGameDayWindow for review polling.
 */

import { GameStatus } from "@prisma/client";

import { getGameDayWindow } from "@/lib/game-day";
import { teamSlugFromImport } from "@/lib/import-slugs";
import {
  NCAA_BIG_TEN_2026_HOME_FIXTURES,
  type BigTenHomeFixture
} from "@/lib/schedules/ncaa-big-ten-2026-data";

export const NCAA_FOOTBALL_LEAGUE = "NCAA Football";
export const NCAA_BIG_TEN_SEASON = 2026;

export type MappedNcaaBigTenGame = {
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

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

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
export function ncaaBigTenExternalId(fixture: BigTenHomeFixture): string {
  const away = awaySlugFromName(fixture.awayTeamName);
  return `ncaa-fb-${NCAA_BIG_TEN_SEASON}-${fixture.homeTeamSlug}-${dateKeyFromIsoDate(fixture.date)}-${away}`;
}

/**
 * Parse ESPN-style "h:mm AM/PM" as America/New_York wall time on `isoDate`.
 * Tries EDT (-04) then EST (-05) and keeps the instant whose NY wall clock matches.
 */
export function parseEasternKickoff(isoDate: string, kickoffEt: string): Date {
  const m = kickoffEt.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) {
    throw new Error(`Invalid ESPN Eastern kickoff: ${kickoffEt}`);
  }
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const ampm = m[3]!.toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  const wall = `${isoDate}T${pad2(hour)}:${pad2(minute)}:00`;
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });

  for (const offset of ["-04:00", "-05:00"] as const) {
    const candidate = new Date(`${wall}${offset}`);
    if (Number.isNaN(candidate.getTime())) continue;
    const parts = Object.fromEntries(
      fmt.formatToParts(candidate).map((p) => [p.type, p.value])
    );
    const got = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
    const want = `${isoDate}T${pad2(hour)}:${pad2(minute)}`;
    if (got === want) return candidate;
  }

  throw new Error(`Could not resolve Eastern kickoff ${kickoffEt} on ${isoDate}`);
}

/** Local noon on isoDate in America/New_York (display anchor for TBD). */
export function noonEasternOnDate(isoDate: string): Date {
  return parseEasternKickoff(isoDate, "12:00 PM");
}

export function mapBigTenFixture(fixture: BigTenHomeFixture): MappedNcaaBigTenGame {
  const externalId = ncaaBigTenExternalId(fixture);
  if (fixture.kickoffTbd || !fixture.kickoffEt) {
    const startsAt = noonEasternOnDate(fixture.date);
    return {
      externalId,
      league: NCAA_FOOTBALL_LEAGUE,
      season: NCAA_BIG_TEN_SEASON,
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
    season: NCAA_BIG_TEN_SEASON,
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

export function mapAllBigTen2026HomeGames(): MappedNcaaBigTenGame[] {
  return NCAA_BIG_TEN_2026_HOME_FIXTURES.map(mapBigTenFixture);
}

export function ncaaBigTenMappedGameToPrismaData(
  game: MappedNcaaBigTenGame,
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
