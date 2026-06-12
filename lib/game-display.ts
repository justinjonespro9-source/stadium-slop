import type { Game } from "@prisma/client";

import { formatHomeTeamLabel } from "./game-day";
import { WORLD_CUP_LEAGUE } from "./schedules/world-cup-schedule";

export type GameDisplayFields = Pick<
  Game,
  "league" | "homeTeamSlug" | "homeTeamName" | "awayTeamName" | "isNeutralSite"
>;

export type FormatGameDisplayNameOptions = {
  /** Venue tenant label for standard home/away matchups (ignored for neutral-site games). */
  venueHomeTeamLabel?: string;
};

/** True when fixture teams should be shown as "Team A vs Team B" (not "away at venue tenant"). */
export function isNeutralSiteGame(game: GameDisplayFields): boolean {
  return game.isNeutralSite || game.league === WORLD_CUP_LEAGUE;
}

/** Resolve the home-side label from game fields (never falls back to venue tenant for neutral-site games). */
export function resolveGameHomeTeamLabel(
  game: GameDisplayFields,
  venueHomeTeamLabel?: string
): string {
  if (game.homeTeamName?.trim()) {
    return game.homeTeamName.trim();
  }

  if (!isNeutralSiteGame(game) && venueHomeTeamLabel?.trim()) {
    return venueHomeTeamLabel.trim();
  }

  return formatHomeTeamLabel(game.homeTeamSlug);
}

/** Fan-facing matchup label: neutral-site fixtures use "vs"; home games use "away at home". */
export function formatGameDisplayName(
  game: GameDisplayFields,
  options: FormatGameDisplayNameOptions = {}
): string {
  const away = game.awayTeamName.trim();

  if (isNeutralSiteGame(game)) {
    const home = resolveGameHomeTeamLabel(game);
    return `${home} vs ${away}`;
  }

  const home = resolveGameHomeTeamLabel(game, options.venueHomeTeamLabel);
  return `${away} at ${home}`;
}
