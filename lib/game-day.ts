import { GameStatus, type Game } from "@prisma/client";

/** Hours before first pitch when location-certified polling opens. */
export const GAME_DAY_POLLING_OPENS_HOURS_BEFORE_START = 2;

/** Hours after first pitch when location-certified polling closes. */
export const GAME_DAY_POLLING_CLOSES_HOURS_AFTER_START = 4;

/** Default estimated game length when `estimatedEndsAt` is unset (MLB regular season). */
export const GAME_DAY_DEFAULT_DURATION_HOURS = 3;

export const GAME_DAY_INACTIVE_STATUSES: readonly GameStatus[] = [
  GameStatus.CANCELED,
  GameStatus.POSTPONED
];

export type GameDayWindow = {
  pollingOpensAt: Date;
  pollingClosesAt: Date;
  estimatedEndsAt: Date;
};

export type GameDayActivityFields = Pick<
  Game,
  "pollingOpensAt" | "pollingClosesAt" | "status"
>;

/** Local calendar YYYY-MM-DD (browser/server local TZ). */
export function localCalendarDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** UTC calendar YYYY-MM-DD (matches legacy review keys). */
export function utcCalendarDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/** One review per user/item/day — matches Prisma upsert gameDayKey. */
export function buildGameDayKey(venueSlug: string, d = new Date()) {
  const y = d.getFullYear();
  const localDate = localCalendarDateKey(d);
  return `${y}-${venueSlug}-${localDate}`;
}

/** True when this review row is for “today” for the given venue (matches upsert gameDayKey). */
export function isGameDayKeyTodayForVenue(gameDayKey: string, venueSlug: string, d = new Date()) {
  return gameDayKey === buildGameDayKey(venueSlug, d);
}

const MS_PER_HOUR = 60 * 60 * 1000;

/** Compute polling window timestamps from scheduled first pitch (UTC-safe instants). */
export function getGameDayWindow(startsAt: Date): GameDayWindow {
  const startMs = startsAt.getTime();
  return {
    pollingOpensAt: new Date(
      startMs - GAME_DAY_POLLING_OPENS_HOURS_BEFORE_START * MS_PER_HOUR
    ),
    pollingClosesAt: new Date(
      startMs + GAME_DAY_POLLING_CLOSES_HOURS_AFTER_START * MS_PER_HOUR
    ),
    estimatedEndsAt: new Date(
      startMs + GAME_DAY_DEFAULT_DURATION_HOURS * MS_PER_HOUR
    )
  };
}

export function isGameDayInactiveStatus(status: GameStatus) {
  return GAME_DAY_INACTIVE_STATUSES.includes(status);
}

/** True when now falls inside the venue polling window and the game is not canceled/postponed. */
export function isGameDayActive(
  game: GameDayActivityFields,
  now: Date = new Date()
): boolean {
  if (isGameDayInactiveStatus(game.status)) {
    return false;
  }

  const t = now.getTime();
  return (
    t >= game.pollingOpensAt.getTime() && t <= game.pollingClosesAt.getTime()
  );
}

const gameDayDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

const gameDayTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit"
});

export function formatGameDayDateTime(d: Date) {
  return gameDayDateTimeFormatter.format(d);
}

export function formatGameDayTime(d: Date) {
  return gameDayTimeFormatter.format(d);
}

export function formatHomeTeamLabel(homeTeamSlug: string) {
  return homeTeamSlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Server-only venue game lookups (lazy Prisma import). */
export async function getVenueActiveGame(
  venueId: string,
  now: Date = new Date()
): Promise<Game | null> {
  const { prisma } = await import("./prisma");
  const games = await prisma.game.findMany({
    where: {
      venueId,
      pollingOpensAt: { lte: now },
      pollingClosesAt: { gte: now },
      status: { notIn: [...GAME_DAY_INACTIVE_STATUSES] }
    },
    orderBy: { startsAt: "asc" },
    take: 1
  });

  const game = games[0];
  return game && isGameDayActive(game, now) ? game : null;
}

export async function getVenueUpcomingGame(
  venueId: string,
  now: Date = new Date()
): Promise<Game | null> {
  const { prisma } = await import("./prisma");
  return prisma.game.findFirst({
    where: {
      venueId,
      startsAt: { gt: now },
      status: { notIn: [...GAME_DAY_INACTIVE_STATUSES] }
    },
    orderBy: { startsAt: "asc" }
  });
}
