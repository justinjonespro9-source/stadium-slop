/**
 * Map ESPN NBA/NHL regular-season events onto Stadium Slop Game rows.
 *
 * Review windows come from `getGameDayWindow` (90 minutes before start through
 * 5 hours after). They are stored on the Game row. The same helper the NFL
 * importer uses applies here; nothing in game-day mode branches on league.
 *
 * ESPN `timeValid: false` uses the NFL/NCAA placeholder convention:
 * pollingOpensAt === pollingClosesAt so game mode never opens.
 */

import { GameStatus } from "@prisma/client";

import { getGameDayWindow } from "@/lib/game-day";
import {
  mapEspnStatusToGameStatus,
  type EspnArenaScheduleEvent,
  type EspnArenaScheduleFile
} from "@/lib/schedules/espn-team-schedule";

export type ArenaHomeVenueMapping = {
  venueSlug: string;
  homeTeamSlug: string;
  homeTeamName: string;
};

export type ArenaScheduleLeagueConfig = {
  league: "NBA" | "NHL";
  season: number;
  externalIdPrefix: "nba" | "nhl";
  resolveHomeVenue: (teamName: string) => ArenaHomeVenueMapping | null;
  resolveVenueSlug: (venueName: string) => string | null;
};

export type MappedArenaScheduleGame = {
  externalId: string;
  eventId: string;
  league: "NBA" | "NHL";
  season: number;
  homeTeamSlug: string;
  homeTeamName: string;
  awayTeamName: string;
  venueSlug: string;
  startsAt: Date;
  status: GameStatus;
  isNeutralSite: boolean;
  startTbd: boolean;
  pollingOpensAt: Date;
  pollingClosesAt: Date;
  estimatedEndsAt: Date;
  eventNotes: string[];
};

export type UnmappedArenaScheduleGame = {
  eventId: string;
  homeTeamName?: string;
  awayTeamName?: string;
  venueName?: string;
  startsAt: string;
  reason:
    | "invalid-start"
    | "not-regular-season"
    | "unmapped-home-team"
    | "unmapped-neutral-venue"
    | "unmapped-alternate-venue";
};

export type MapArenaScheduleResult = {
  parsed: number;
  mapped: MappedArenaScheduleGame[];
  skipped: UnmappedArenaScheduleGame[];
  duplicateEventIds: string[];
};

export function arenaExternalId(prefix: "nba" | "nhl", eventId: string) {
  return `${prefix}-${eventId}`;
}

/** Parse an ESPN ISO instant. Reject naive local datetimes with no offset. */
export function parseArenaStartInstant(iso: string): Date | null {
  const trimmed = iso.trim();
  if (!trimmed) return null;
  if (!/Z|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return null;
  }
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isEspnRegularSeasonEvent(event: EspnArenaScheduleEvent) {
  if (event.seasonTypeId === 2) return true;
  if (event.seasonTypeId != null) return false;
  if (/regular/i.test(event.seasonTypeName)) return true;
  return event.seasonTypeName.trim() === "";
}

function resolveGameVenue(
  event: EspnArenaScheduleEvent,
  config: ArenaScheduleLeagueConfig
):
  | { venueSlug: string; isNeutralSite: boolean; home: ArenaHomeVenueMapping | null }
  | { skip: UnmappedArenaScheduleGame["reason"] } {
  const home = config.resolveHomeVenue(event.homeTeamName);
  const byVenue = event.venueName ? config.resolveVenueSlug(event.venueName) : null;

  if (event.isNeutralSite) {
    if (!home) return { skip: "unmapped-home-team" };
    if (!byVenue) return { skip: "unmapped-neutral-venue" };
    return { venueSlug: byVenue, isNeutralSite: true, home };
  }

  if (!home) {
    return { skip: "unmapped-home-team" };
  }

  if (byVenue && byVenue !== home.venueSlug) {
    return { venueSlug: byVenue, isNeutralSite: false, home };
  }

  if (event.venueName && !byVenue) {
    return { skip: "unmapped-alternate-venue" };
  }

  return { venueSlug: home.venueSlug, isNeutralSite: false, home };
}

export function mapArenaScheduleEvents(
  events: EspnArenaScheduleEvent[],
  config: ArenaScheduleLeagueConfig
): MapArenaScheduleResult {
  const mapped: MappedArenaScheduleGame[] = [];
  const skipped: UnmappedArenaScheduleGame[] = [];
  const duplicateEventIds: string[] = [];
  const seen = new Set<string>();

  for (const event of events) {
    if (seen.has(event.eventId)) {
      duplicateEventIds.push(event.eventId);
      continue;
    }
    seen.add(event.eventId);

    if (!isEspnRegularSeasonEvent(event)) {
      skipped.push({
        eventId: event.eventId,
        homeTeamName: event.homeTeamName,
        awayTeamName: event.awayTeamName,
        venueName: event.venueName,
        startsAt: event.startsAt,
        reason: "not-regular-season"
      });
      continue;
    }

    const startsAt = parseArenaStartInstant(event.startsAt);
    if (!startsAt) {
      skipped.push({
        eventId: event.eventId,
        homeTeamName: event.homeTeamName,
        awayTeamName: event.awayTeamName,
        venueName: event.venueName,
        startsAt: event.startsAt,
        reason: "invalid-start"
      });
      continue;
    }

    const venue = resolveGameVenue(event, config);
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

    const startTbd = event.timeValid === false;
    const window = getGameDayWindow(startsAt);
    const home = venue.home;

    mapped.push({
      externalId: arenaExternalId(config.externalIdPrefix, event.eventId),
      eventId: event.eventId,
      league: config.league,
      season: config.season,
      homeTeamSlug: home?.homeTeamSlug ?? "",
      homeTeamName: home?.homeTeamName ?? event.homeTeamName,
      awayTeamName: event.awayTeamName,
      venueSlug: venue.venueSlug,
      startsAt,
      status: mapEspnStatusToGameStatus(event.statusName),
      isNeutralSite: venue.isNeutralSite,
      startTbd,
      pollingOpensAt: startTbd ? startsAt : window.pollingOpensAt,
      pollingClosesAt: startTbd ? startsAt : window.pollingClosesAt,
      estimatedEndsAt: startTbd ? startsAt : window.estimatedEndsAt,
      eventNotes: event.notes
    });
  }

  return {
    parsed: events.length,
    mapped,
    skipped,
    duplicateEventIds
  };
}

export function mapArenaScheduleFile(
  file: EspnArenaScheduleFile,
  config: ArenaScheduleLeagueConfig
): MapArenaScheduleResult {
  return mapArenaScheduleEvents(file.events, config);
}

export function arenaMappedGameToPrismaData(
  game: MappedArenaScheduleGame,
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

export type ExistingArenaScheduleGame = {
  externalId: string | null;
  startsAt: Date;
  status: GameStatus;
  venueSlug: string;
  homeTeamSlug: string;
  homeTeamName: string | null;
  awayTeamName: string;
  isNeutralSite: boolean;
  season: number;
  pollingOpensAt: Date;
  pollingClosesAt: Date;
  estimatedEndsAt: Date | null;
};

export type ArenaScheduleWritePlan = {
  create: MappedArenaScheduleGame[];
  update: MappedArenaScheduleGame[];
  unchanged: MappedArenaScheduleGame[];
  duplicateExternalIds: string[];
  nullExternalIds: number;
  notInSource: ExistingArenaScheduleGame[];
};

function sameInstant(a: Date | null | undefined, b: Date) {
  return a instanceof Date && a.getTime() === b.getTime();
}

function gameFieldsMatch(
  existing: ExistingArenaScheduleGame,
  incoming: MappedArenaScheduleGame
) {
  return (
    existing.season === incoming.season &&
    existing.homeTeamSlug === incoming.homeTeamSlug &&
    (existing.homeTeamName ?? "") === incoming.homeTeamName &&
    existing.awayTeamName === incoming.awayTeamName &&
    existing.isNeutralSite === incoming.isNeutralSite &&
    existing.venueSlug === incoming.venueSlug &&
    existing.status === incoming.status &&
    sameInstant(existing.startsAt, incoming.startsAt) &&
    sameInstant(existing.pollingOpensAt, incoming.pollingOpensAt) &&
    sameInstant(existing.pollingClosesAt, incoming.pollingClosesAt) &&
    sameInstant(existing.estimatedEndsAt, incoming.estimatedEndsAt)
  );
}

/** In-memory reconciliation. Does not delete rows that are absent from the source. */
export function planArenaScheduleWrites(
  existing: ExistingArenaScheduleGame[],
  incoming: MappedArenaScheduleGame[]
): ArenaScheduleWritePlan {
  const duplicateExternalIds: string[] = [];
  const incomingByExternal = new Map<string, MappedArenaScheduleGame>();
  for (const game of incoming) {
    if (incomingByExternal.has(game.externalId)) {
      duplicateExternalIds.push(game.externalId);
    }
    incomingByExternal.set(game.externalId, game);
  }

  const existingByExternal = new Map<string, ExistingArenaScheduleGame>();
  let nullExternalIds = 0;
  for (const game of existing) {
    if (!game.externalId) {
      nullExternalIds += 1;
      continue;
    }
    if (existingByExternal.has(game.externalId)) {
      duplicateExternalIds.push(game.externalId);
    }
    existingByExternal.set(game.externalId, game);
  }

  const create: MappedArenaScheduleGame[] = [];
  const update: MappedArenaScheduleGame[] = [];
  const unchanged: MappedArenaScheduleGame[] = [];

  for (const game of incomingByExternal.values()) {
    const prior = existingByExternal.get(game.externalId);
    if (!prior) {
      create.push(game);
    } else if (gameFieldsMatch(prior, game)) {
      unchanged.push(game);
    } else {
      update.push(game);
    }
  }

  const notInSource = [...existingByExternal.values()].filter(
    (game) => game.externalId && !incomingByExternal.has(game.externalId)
  );

  return {
    create,
    update,
    unchanged,
    duplicateExternalIds,
    nullExternalIds,
    notInSource
  };
}
