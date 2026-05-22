import { GameStatus, type Game } from "@prisma/client";

/** Fallback on-site radius when a venue row has no valid `reviewRadiusMeters`. */
export const DEFAULT_GAME_DAY_REVIEW_RADIUS_METERS = 750;

/** Minutes before event start when location-certified review polling opens. */
export const GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START = 90;

/** Minutes after event start when location-certified review polling closes. */
export const GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START = 5 * 60;

/** @deprecated Use {@link GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START}. */
export const GAME_DAY_POLLING_OPENS_HOURS_BEFORE_START =
  GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START / 60;

/** @deprecated Use {@link GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START}. */
export const GAME_DAY_POLLING_CLOSES_HOURS_AFTER_START =
  GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START / 60;

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

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

/** Compute polling window timestamps from scheduled first pitch (UTC-safe instants). */
export function getGameDayWindow(startsAt: Date): GameDayWindow {
  const startMs = startsAt.getTime();
  return {
    pollingOpensAt: new Date(
      startMs - GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START * MS_PER_MINUTE
    ),
    pollingClosesAt: new Date(
      startMs + GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START * MS_PER_MINUTE
    ),
    estimatedEndsAt: new Date(
      startMs + GAME_DAY_DEFAULT_DURATION_HOURS * MS_PER_HOUR
    )
  };
}

/** Distinct gameDayKey for admin QA reviews (does not collide with certified keys). */
export function buildTestReviewGameDayKey(venueSlug: string, d = new Date()) {
  return `test-${buildGameDayKey(venueSlug, d)}`;
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

/** Fan-facing summary of the certified review window. */
export function formatGameDayPollingWindowHoursLabel() {
  return `${GAME_DAY_POLLING_OPENS_MINUTES_BEFORE_START} minutes before first pitch through ${GAME_DAY_POLLING_CLOSES_MINUTES_AFTER_START / 60} hours after`;
}

/** Certified review window for a scheduled home game. */
export function formatGameDayPollingWindowRange(
  pollingOpensAt: Date,
  pollingClosesAt: Date
) {
  return `${formatGameDayTime(pollingOpensAt)} – ${formatGameDayTime(pollingClosesAt)}`;
}

export {
  formatGameDateTimeForVenue,
  formatGameDayPollingWindowRangeForVenue,
  formatGameTimeForVenue,
  formatVenueTimeZoneAbbrev,
  getVenueTimeZone,
  parseDatetimeLocalInTimeZone,
  toDatetimeLocalValueForTimeZone,
  type VenueTimeZoneInput
} from "./venue-timezone";

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

export function resolveVenueReviewRadiusMeters(reviewRadiusMeters: number) {
  return Number.isFinite(reviewRadiusMeters) && reviewRadiusMeters > 0
    ? Math.round(reviewRadiusMeters)
    : DEFAULT_GAME_DAY_REVIEW_RADIUS_METERS;
}

const EARTH_RADIUS_METERS = 6_371_000;

/** Great-circle distance in meters (WGS84). */
export function distanceMetersBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

export type GameDayReviewLocation = {
  latitude: number;
  longitude: number;
};

export function parseReviewLocationFromForm(
  formData: FormData
): GameDayReviewLocation | null {
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }
  return { latitude, longitude };
}

export const GAME_DAY_REVIEW_ERROR_MESSAGES = {
  "no-active-game": "Reviews open during active home-game windows only.",
  "missing-location":
    "Location certification is required to submit a game-day review.",
  "outside-radius": "You must be at the stadium to submit a certified review."
} as const;

export type GameDayReviewErrorCode = keyof typeof GAME_DAY_REVIEW_ERROR_MESSAGES;

export function validateGameDayReviewSubmission(options: {
  activeGame: Game | null;
  venueLatitude: number;
  venueLongitude: number;
  reviewRadiusMeters: number;
  location: GameDayReviewLocation | null;
}):
  | {
      ok: true;
      game: Game;
      distanceFromVenueMeters: number;
      allowedRadiusMeters: number;
    }
  | { ok: false; code: GameDayReviewErrorCode } {
  if (!options.activeGame) {
    return { ok: false, code: "no-active-game" };
  }

  if (!options.location) {
    return { ok: false, code: "missing-location" };
  }

  const allowedRadiusMeters = resolveVenueReviewRadiusMeters(
    options.reviewRadiusMeters
  );
  const distanceFromVenueMeters = distanceMetersBetween(
    options.location.latitude,
    options.location.longitude,
    options.venueLatitude,
    options.venueLongitude
  );

  if (distanceFromVenueMeters > allowedRadiusMeters) {
    return { ok: false, code: "outside-radius" };
  }

  return {
    ok: true,
    game: options.activeGame,
    distanceFromVenueMeters,
    allowedRadiusMeters
  };
}
