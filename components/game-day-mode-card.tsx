import type { Game } from "@prisma/client";

import {
  formatGameDateTimeForVenue,
  formatGameDayPollingWindowHoursLabel,
  formatGameDayPollingWindowRangeForVenue,
  formatGameTimeForVenue,
  isGameDayActive
} from "@/lib/game-day";
import { formatGameDisplayName } from "@/lib/game-display";
import {
  formatFairEventDateRange,
  isStateFairEventGame
} from "@/lib/schedules/fair-event-window";

type GameDayModeCardProps = {
  /** Primary venue tenant — used for standard home games only, not World Cup / neutral-site fixtures. */
  venueHomeTeamLabel?: string;
  venueTimeZone: string;
  activeGame: Game | null;
  upcomingGame: Game | null;
  now?: Date;
};

export function GameDayModeCard({
  venueHomeTeamLabel = "",
  venueTimeZone,
  activeGame,
  upcomingGame,
  now = new Date()
}: GameDayModeCardProps) {
  if (activeGame && isGameDayActive(activeGame, now)) {
    const matchup = formatGameDisplayName(activeGame, { venueHomeTeamLabel });
    const isFairEvent = isStateFairEventGame(activeGame);
    const windowRange = isFairEvent
      ? formatFairEventDateRange(
          activeGame.pollingOpensAt,
          activeGame.pollingClosesAt,
          venueTimeZone
        )
      : formatGameDayPollingWindowRangeForVenue(
          activeGame.pollingOpensAt,
          activeGame.pollingClosesAt,
          venueTimeZone
        );

    return (
      <article
        className="media-panel-card media-panel-card--accent p-4 sm:rounded-2xl sm:p-5"
        aria-labelledby="game-day-mode-heading"
      >
        <p className="media-section-eyebrow">
          {isFairEvent ? "Fair Day Mode" : "Game Day Mode"}
        </p>
        <h2
          id="game-day-mode-heading"
          className="mt-1 text-lg font-black leading-snug text-[var(--media-ink)] sm:text-xl"
        >
          {matchup}
        </h2>
        {isFairEvent ? (
          <p className="mt-1.5 text-sm text-[var(--media-ink-muted)]">
            Fair dates · {windowRange}
          </p>
        ) : (
          <p className="mt-1.5 text-sm text-[var(--media-ink-muted)]">
            First pitch ·{" "}
            {formatGameTimeForVenue(activeGame.startsAt, venueTimeZone, {
              includeZone: true
            })}
          </p>
        )}
        <p className="mt-1 text-xs font-semibold text-[var(--media-orange-deep)]">
          Certified review window · {windowRange}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--media-ink-dim)]">
          {isFairEvent
            ? "Location-certified reviews during fair dates power today's Fresh Score. Unofficial fan-powered food guide — not affiliated with the fair."
            : `Location-certified reviews (${formatGameDayPollingWindowHoursLabel()}) power today's Fresh Score. Unofficial fan-powered food guide — not affiliated with teams or venues.`}
        </p>
      </article>
    );
  }

  if (!upcomingGame) {
    return null;
  }

  const matchup = formatGameDisplayName(upcomingGame, { venueHomeTeamLabel });
  const isFairEvent = isStateFairEventGame(upcomingGame);

  return (
    <article className="media-panel-card px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="media-section-eyebrow">
        {isFairEvent ? "Upcoming fair" : "Next home game"}
      </p>
      <p className="mt-1 text-sm font-bold text-[var(--media-ink)]">
        {matchup} —{" "}
        {isFairEvent
          ? formatFairEventDateRange(
              upcomingGame.pollingOpensAt,
              upcomingGame.pollingClosesAt,
              venueTimeZone
            )
          : formatGameDateTimeForVenue(upcomingGame.startsAt, venueTimeZone, {
              includeZone: true
            })}
      </p>
    </article>
  );
}
