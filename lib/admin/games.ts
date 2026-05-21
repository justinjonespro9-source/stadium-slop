import "server-only";

import type { GameStatus, Prisma } from "@prisma/client";

import { getGameDayWindow } from "@/lib/game-day";
import {
  endOfVenueLocalDay,
  formatGameDateTimeForVenue,
  formatVenueTimeZoneAbbrev,
  parseDatetimeLocalInTimeZone,
  toDatetimeLocalValueForTimeZone
} from "@/lib/venue-timezone";

export type { VenueTimeZoneInput } from "@/lib/venue-timezone";
export {
  formatGameDateTimeForVenue,
  formatVenueTimeZoneAbbrev,
  getVenueTimeZone,
  parseDatetimeLocalInTimeZone,
  toDatetimeLocalValueForTimeZone
} from "@/lib/venue-timezone";

export type AdminGamesListFilters = {
  league?: string;
  status?: GameStatus;
  q?: string;
  range?: "upcoming" | "past" | "all";
};

/** Admin table display — venue local time with zone label. */
export function formatAdminGameDateTime(d: Date, timeZone: string) {
  return formatGameDateTimeForVenue(d, timeZone, { includeZone: true });
}

export function buildAdminGamesWhere(
  filters: AdminGamesListFilters,
  now = new Date()
): Prisma.GameWhereInput {
  const where: Prisma.GameWhereInput = {};

  if (filters.league?.trim()) {
    where.league = filters.league.trim();
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const range = filters.range ?? "upcoming";
  if (range === "upcoming") {
    where.startsAt = { gte: now };
  } else if (range === "past") {
    where.startsAt = { lt: now };
  }

  const q = filters.q?.trim();
  if (q) {
    where.OR = [
      { homeTeamSlug: { contains: q, mode: "insensitive" } },
      { awayTeamName: { contains: q, mode: "insensitive" } },
      { externalId: { contains: q, mode: "insensitive" } },
      { venue: { name: { contains: q, mode: "insensitive" } } },
      { venue: { slug: { contains: q, mode: "insensitive" } } }
    ];
  }

  return where;
}

export function gameStatusLabel(status: GameStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function extendPollingClosesAt(
  current: Date,
  extend: "1h" | "2h" | "eod",
  reference: Date,
  timeZone: string
): Date {
  if (extend === "1h") {
    return new Date(current.getTime() + 60 * 60 * 1000);
  }
  if (extend === "2h") {
    return new Date(current.getTime() + 2 * 60 * 60 * 1000);
  }
  const end = endOfVenueLocalDay(reference, timeZone);
  return end.getTime() > current.getTime() ? end : current;
}

export function applyRecalculatedPollingWindow(startsAt: Date) {
  const window = getGameDayWindow(startsAt);
  return {
    pollingOpensAt: window.pollingOpensAt,
    pollingClosesAt: window.pollingClosesAt,
    estimatedEndsAt: window.estimatedEndsAt
  };
}
