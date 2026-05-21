import "server-only";

import type { GameStatus, Prisma } from "@prisma/client";

import { getGameDayWindow } from "@/lib/game-day";

export type AdminGamesListFilters = {
  league?: string;
  status?: GameStatus;
  q?: string;
  range?: "upcoming" | "past" | "all";
};

export function formatAdminGameDateTime(d: Date) {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

/** Value for `<input type="datetime-local" />` (local timezone). */
export function toDatetimeLocalValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function parseDatetimeLocalValue(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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
  reference: Date = current
): Date {
  if (extend === "1h") {
    return new Date(current.getTime() + 60 * 60 * 1000);
  }
  if (extend === "2h") {
    return new Date(current.getTime() + 2 * 60 * 60 * 1000);
  }
  const end = new Date(reference);
  end.setHours(23, 59, 59, 999);
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
