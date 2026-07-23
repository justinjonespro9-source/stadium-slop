/**
 * Multi-day state fair review windows (continuous fair dates, not game-day ±N hours).
 *
 * Stored as a single `Game` row with explicit `pollingOpensAt` / `pollingClosesAt`
 * spanning the full fair. Stadium sync paths that call `getGameDayWindow(startsAt)`
 * are unchanged.
 */

import { GameStatus } from "@prisma/client";

import { parseDatetimeLocalInTimeZone } from "@/lib/venue-timezone";
import { FAIR_VENUE_TIMEZONE } from "@/lib/fair-venue-geo";
import type { FairVenueSlug } from "@/lib/fair-import/venues";

export const STATE_FAIR_LEAGUE = "State Fair";

export type FairEventWindowSpec = {
  venueSlug: FairVenueSlug;
  season: number;
  /** Inclusive local calendar start date YYYY-MM-DD (fair opens this day at 00:00). */
  opensLocalDate: string;
  /**
   * Exclusive local calendar end date YYYY-MM-DD (window closes at 00:00 this day).
   * For a fair ending Aug 16, use Aug 17 so Aug 16 is fully included.
   */
  closesLocalDate: string;
  displayName: string;
  timeZone?: string;
};

export type FairEventGameFields = {
  externalId: string;
  league: typeof STATE_FAIR_LEAGUE;
  season: number;
  homeTeamSlug: string;
  homeTeamName: string;
  awayTeamName: string;
  isNeutralSite: boolean;
  startsAt: Date;
  estimatedEndsAt: Date;
  pollingOpensAt: Date;
  pollingClosesAt: Date;
  status: GameStatus;
};

/** Stable external id: fair-{venueSlug}-{season} */
export function fairEventExternalId(venueSlug: string, season: number): string {
  return `fair-${venueSlug}-${season}`;
}

export function isStateFairEventGame(game: {
  league: string;
  externalId?: string | null;
}): boolean {
  if (game.league === STATE_FAIR_LEAGUE) return true;
  return Boolean(game.externalId?.startsWith("fair-"));
}

/**
 * Wisconsin State Fair 2026 — Aug 6 through Aug 16 (closes at midnight Aug 17 CT).
 */
export const WISCONSIN_STATE_FAIR_2026_WINDOW: FairEventWindowSpec = {
  venueSlug: "wisconsin-state-fair",
  season: 2026,
  opensLocalDate: "2026-08-06",
  closesLocalDate: "2026-08-17",
  displayName: "Wisconsin State Fair 2026",
  timeZone: "America/Chicago"
};

function requireLocalMidnight(localDate: string, timeZone: string): Date {
  const parsed = parseDatetimeLocalInTimeZone(`${localDate}T00:00`, timeZone);
  if (!parsed) {
    throw new Error(
      `Invalid fair window local date "${localDate}" in timezone ${timeZone}`
    );
  }
  return parsed;
}

/** Build Prisma Game create/update payload for a continuous fair review window. */
export function buildFairEventGameData(
  spec: FairEventWindowSpec
): FairEventGameFields {
  const timeZone =
    spec.timeZone ?? FAIR_VENUE_TIMEZONE[spec.venueSlug] ?? "America/Chicago";
  const opensAt = requireLocalMidnight(spec.opensLocalDate, timeZone);
  const closesAt = requireLocalMidnight(spec.closesLocalDate, timeZone);

  if (!(closesAt.getTime() > opensAt.getTime())) {
    throw new Error(
      `Fair window close must be after open (${spec.opensLocalDate} → ${spec.closesLocalDate})`
    );
  }

  return {
    externalId: fairEventExternalId(spec.venueSlug, spec.season),
    league: STATE_FAIR_LEAGUE,
    season: spec.season,
    homeTeamSlug: spec.venueSlug,
    homeTeamName: spec.displayName,
    awayTeamName: "Fair Season",
    isNeutralSite: false,
    startsAt: opensAt,
    estimatedEndsAt: closesAt,
    pollingOpensAt: opensAt,
    pollingClosesAt: closesAt,
    status: GameStatus.SCHEDULED
  };
}

/** Fan-facing date range for a fair event window (venue timezone). */
export function formatFairEventDateRange(
  opensAt: Date,
  closesAt: Date,
  timeZone: string
): string {
  const openFmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  // Last inclusive fair day is the calendar day before exclusive close.
  const lastDayMs = closesAt.getTime() - 1;
  const lastDay = new Date(lastDayMs);
  const closeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  return `${openFmt.format(opensAt)} – ${closeFmt.format(lastDay)}`;
}
