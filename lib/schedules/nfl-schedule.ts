/**
 * Map ESPN NFL events → Prisma Game upsert payloads.
 *
 * Review windows are derived with `getGameDayWindow` (90 minutes before kickoff
 * through 5 hours after). They are stored on Game rows, not computed at
 * request time. ESPN `timeValid: false` (flex TBD) uses the NCAA TBD
 * convention: pollingOpensAt === pollingClosesAt so game mode never opens on a
 * placeholder 05:00Z instant.
 */

import { GameStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getGameDayWindow } from "@/lib/game-day";
import {
  mapEspnNflStatusToGameStatus,
  type NflEspnScheduleEvent,
  type NflEspnScheduleFile
} from "@/lib/schedules/nfl-espn";
import {
  isNflInternationalVenueSlug,
  nflHomeTeamSlugFromName,
  resolveHomeVenueByTeamName,
  resolveVenueSlugByEspnVenueName
} from "@/lib/schedules/nfl-team-venue-map";
import {
  utcInstantInRange,
  type ScheduleSyncDateRange
} from "@/lib/schedules/schedule-sync-range";

export const NFL_LEAGUE = "NFL";
export const NFL_SEASON = 2026;

export type MappedNflScheduleGame = {
  externalId: string;
  eventId: string;
  league: typeof NFL_LEAGUE;
  season: number;
  week: number;
  homeTeamSlug: string;
  homeTeamName: string;
  awayTeamName: string;
  venueSlug: string;
  startsAt: Date;
  status: GameStatus;
  isNeutralSite: boolean;
  kickoffTbd: boolean;
  pollingOpensAt: Date;
  pollingClosesAt: Date;
  estimatedEndsAt: Date;
};

export type UnmappedNflScheduleGame = {
  eventId: string;
  homeTeamName?: string;
  awayTeamName?: string;
  venueName?: string;
  startsAt: string;
  reason:
    | "invalid-kickoff"
    | "unmapped-home-team"
    | "unmapped-neutral-venue"
    | "outside-date-range";
};

export type MapNflScheduleResult = {
  parsed: number;
  mapped: MappedNflScheduleGame[];
  skipped: UnmappedNflScheduleGame[];
};

const FIXTURES_PATH = join(process.cwd(), "data/nfl/2026-regular-season.json");

export function nflScheduleFilePath() {
  return FIXTURES_PATH;
}

export function loadNflScheduleFile(): NflEspnScheduleFile {
  const raw = readFileSync(FIXTURES_PATH, "utf8");
  return JSON.parse(raw) as NflEspnScheduleFile;
}

export function nflExternalId(eventId: string): string {
  return `nfl-${eventId}`;
}

/**
 * Parse ESPN kickoff ISO as an absolute instant.
 * Rejects naive local datetimes (`YYYY-MM-DDTHH:mm` with no offset).
 */
export function parseNflKickoffInstant(iso: string): Date | null {
  const trimmed = iso.trim();
  if (!trimmed) return null;
  if (!/Z|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return null;
  }
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveGameVenue(
  event: NflEspnScheduleEvent
): { venueSlug: string; isNeutralSite: boolean } | { skip: UnmappedNflScheduleGame["reason"] } {
  const byVenue = event.venueName
    ? resolveVenueSlugByEspnVenueName(event.venueName)
    : null;
  const home = resolveHomeVenueByTeamName(event.homeTeamName);
  const international = Boolean(byVenue && isNflInternationalVenueSlug(byVenue));
  const isNeutralSite = event.isNeutralSite || international;

  if (isNeutralSite) {
    if (!byVenue) return { skip: "unmapped-neutral-venue" };
    return { venueSlug: byVenue, isNeutralSite: true };
  }

  if (home) {
    return { venueSlug: home.venueSlug, isNeutralSite: false };
  }

  if (byVenue) {
    return { venueSlug: byVenue, isNeutralSite: false };
  }

  return { skip: "unmapped-home-team" };
}

export function mapNflScheduleEvents(
  events: NflEspnScheduleEvent[],
  range?: ScheduleSyncDateRange
): MapNflScheduleResult {
  const mapped: MappedNflScheduleGame[] = [];
  const skipped: UnmappedNflScheduleGame[] = [];

  for (const event of events) {
    const startsAt = parseNflKickoffInstant(event.startsAt);
    if (!startsAt) {
      skipped.push({
        eventId: event.eventId,
        homeTeamName: event.homeTeamName,
        awayTeamName: event.awayTeamName,
        venueName: event.venueName,
        startsAt: event.startsAt,
        reason: "invalid-kickoff"
      });
      continue;
    }

    if (range && !utcInstantInRange(startsAt.toISOString(), range)) {
      skipped.push({
        eventId: event.eventId,
        homeTeamName: event.homeTeamName,
        awayTeamName: event.awayTeamName,
        venueName: event.venueName,
        startsAt: event.startsAt,
        reason: "outside-date-range"
      });
      continue;
    }

    const venue = resolveGameVenue(event);
    if ("skip" in venue) {
      skipped.push({
        eventId: event.eventId,
        homeTeamName: event.homeTeamName,
        awayTeamName: event.awayTeamName,
        venueName: event.venueName,
        startsAt: event.startsAt,
        reason: venue.skip
      });
      continue;
    }

    const kickoffTbd = event.timeValid === false;
    const window = getGameDayWindow(startsAt);
    const homeMapping = resolveHomeVenueByTeamName(event.homeTeamName);

    mapped.push({
      externalId: nflExternalId(event.eventId),
      eventId: event.eventId,
      league: NFL_LEAGUE,
      season: event.season || NFL_SEASON,
      week: event.week,
      homeTeamSlug: homeMapping?.homeTeamSlug ?? nflHomeTeamSlugFromName(event.homeTeamName),
      homeTeamName: homeMapping?.homeTeamName ?? event.homeTeamName,
      awayTeamName: event.awayTeamName,
      venueSlug: venue.venueSlug,
      startsAt,
      status: mapEspnNflStatusToGameStatus(event.statusName),
      isNeutralSite: venue.isNeutralSite,
      kickoffTbd,
      pollingOpensAt: kickoffTbd ? startsAt : window.pollingOpensAt,
      pollingClosesAt: kickoffTbd ? startsAt : window.pollingClosesAt,
      estimatedEndsAt: kickoffTbd ? startsAt : window.estimatedEndsAt
    });
  }

  return {
    parsed: events.length,
    mapped,
    skipped
  };
}

export function mapNflScheduleFile(
  file: NflEspnScheduleFile,
  range?: ScheduleSyncDateRange
): MapNflScheduleResult {
  return mapNflScheduleEvents(file.events, range);
}

export function loadMappedNflSchedule(
  range?: ScheduleSyncDateRange
): MapNflScheduleResult {
  return mapNflScheduleFile(loadNflScheduleFile(), range);
}

export function nflMappedGameToPrismaData(
  game: MappedNflScheduleGame,
  venueId: string
) {
  return {
    league: game.league,
    season: game.season,
    homeTeamSlug: game.homeTeamSlug,
    homeTeamName: game.homeTeamName,
    awayTeamName: game.awayTeamName,
    isNeutralSite: game.isNeutralSite,
    venueId,
    startsAt: game.startsAt,
    estimatedEndsAt: game.estimatedEndsAt,
    pollingOpensAt: game.pollingOpensAt,
    pollingClosesAt: game.pollingClosesAt,
    status: game.status,
    externalId: game.externalId
  };
}

/** In-memory upsert by `externalId` — documents idempotent import behavior. */
export function upsertNflGamesByExternalId(
  existing: MappedNflScheduleGame[],
  incoming: MappedNflScheduleGame[]
): { created: number; updated: number; byExternalId: Map<string, MappedNflScheduleGame> } {
  const byExternalId = new Map(existing.map((g) => [g.externalId, g]));
  let created = 0;
  let updated = 0;
  for (const game of incoming) {
    if (byExternalId.has(game.externalId)) {
      updated += 1;
    } else {
      created += 1;
    }
    byExternalId.set(game.externalId, game);
  }
  return { created, updated, byExternalId };
}
