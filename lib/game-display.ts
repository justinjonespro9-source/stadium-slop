import type { Game } from "@prisma/client";

import { formatHomeTeamLabel } from "./game-day";
import { isStateFairEventGame } from "./schedules/fair-event-window";
import { WORLD_CUP_LEAGUE } from "./schedules/world-cup-schedule";

export type GameDisplayFields = Pick<
  Game,
  | "league"
  | "homeTeamSlug"
  | "homeTeamName"
  | "awayTeamName"
  | "isNeutralSite"
  | "externalId"
>;

/**
 * Home-side label for matchup text.
 * Prefer `homeTeamName`, else title-case `homeTeamSlug`.
 * Never infer from the venue’s primary / first-listed team.
 */
export function resolveGameHomeTeamLabel(game: GameDisplayFields): string {
  if (game.homeTeamName?.trim()) {
    return game.homeTeamName.trim();
  }

  return formatHomeTeamLabel(game.homeTeamSlug);
}

/** True when fixture teams should be shown as "Team A vs Team B" (not "away at home"). */
export function isNeutralSiteGame(game: GameDisplayFields): boolean {
  return game.isNeutralSite || game.league === WORLD_CUP_LEAGUE;
}

/** Fan-facing matchup label: neutral-site fixtures use "vs"; home games use "away at home". */
export function formatGameDisplayName(game: GameDisplayFields): string {
  if (isStateFairEventGame(game)) {
    return resolveGameHomeTeamLabel(game);
  }

  const away = game.awayTeamName.trim();
  const home = resolveGameHomeTeamLabel(game);

  if (isNeutralSiteGame(game)) {
    return `${home} vs ${away}`;
  }

  return `${away} at ${home}`;
}
