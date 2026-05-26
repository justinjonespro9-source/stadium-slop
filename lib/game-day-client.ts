/** Pure game-day calendar helpers — safe for client bundles (no Prisma/DB). */

/** Local calendar YYYY-MM-DD (browser/server local TZ). */
export function localCalendarDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** One review per user/item/day — matches Prisma upsert gameDayKey. */
export function buildGameDayKey(venueSlug: string, d = new Date()) {
  const y = d.getFullYear();
  const localDate = localCalendarDateKey(d);
  return `${y}-${venueSlug}-${localDate}`;
}

/** True when this review row is for “today” for the given venue (matches upsert gameDayKey). */
export function isGameDayKeyTodayForVenue(
  gameDayKey: string,
  venueSlug: string,
  d = new Date()
) {
  return gameDayKey === buildGameDayKey(venueSlug, d);
}
