/**
 * FIFA World Cup 2026 competition archive flag.
 *
 * The tournament is complete. Discovery UI should not treat it as active/upcoming.
 * Historical guide routes, Game rows, venues, menus, and reviews remain intact.
 */

/** When true, World Cup 2026 is a completed competition (not live product surface). */
export const WORLD_CUP_2026_ARCHIVED = true;

/**
 * Leagues excluded from active/upcoming certified review windows.
 * Keep in sync with `WORLD_CUP_LEAGUE` in world-cup-schedule.ts.
 */
export const ARCHIVED_COMPETITION_LEAGUES: readonly string[] = ["World Cup"];

export function isArchivedCompetitionLeague(league: string): boolean {
  return ARCHIVED_COMPETITION_LEAGUES.includes(league);
}
