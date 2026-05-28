import type { Game } from "@prisma/client";

import {
  formatGameDateTimeForVenue,
  formatGameDayPollingWindowHoursLabel,
  formatGameDayPollingWindowRangeForVenue,
  formatGameTimeForVenue,
  formatHomeTeamLabel,
  isGameDayActive
} from "@/lib/game-day";

type GameDayModeCardProps = {
  homeTeamLabel: string;
  venueTimeZone: string;
  activeGame: Game | null;
  upcomingGame: Game | null;
  now?: Date;
};

export function GameDayModeCard({
  homeTeamLabel,
  venueTimeZone,
  activeGame,
  upcomingGame,
  now = new Date()
}: GameDayModeCardProps) {
  if (activeGame && isGameDayActive(activeGame, now)) {
    const matchup = `${activeGame.awayTeamName} at ${homeTeamLabel}`;
    const windowRange = formatGameDayPollingWindowRangeForVenue(
      activeGame.pollingOpensAt,
      activeGame.pollingClosesAt,
      venueTimeZone
    );
    const startLabel = formatGameTimeForVenue(activeGame.startsAt, venueTimeZone, {
      includeZone: true
    });

    return (
      <article
        className="media-panel-card media-panel-card--accent p-4 sm:rounded-2xl sm:p-5"
        aria-labelledby="game-day-mode-heading"
      >
        <p className="media-section-eyebrow">Game Day Mode</p>
        <h2
          id="game-day-mode-heading"
          className="mt-1 text-lg font-black leading-snug text-[var(--media-ink)] sm:text-xl"
        >
          {matchup}
        </h2>
        <p className="mt-1.5 text-sm text-[var(--media-ink-muted)]">
          First pitch · {startLabel}
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--media-orange-deep)]">
          Certified review window · {windowRange}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--media-ink-dim)]">
          Location-certified reviews ({formatGameDayPollingWindowHoursLabel()})
          power today&apos;s Fresh Score. Unofficial fan-powered food guide — not
          affiliated with teams or venues.
        </p>
      </article>
    );
  }

  if (!upcomingGame) {
    return null;
  }

  const home =
    homeTeamLabel || formatHomeTeamLabel(upcomingGame.homeTeamSlug);
  const matchup = `${upcomingGame.awayTeamName} at ${home}`;

  return (
    <article className="media-panel-card px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="media-section-eyebrow">Next home game</p>
      <p className="mt-1 text-sm font-bold text-[var(--media-ink)]">
        {matchup} —{" "}
        {formatGameDateTimeForVenue(upcomingGame.startsAt, venueTimeZone, {
          includeZone: true
        })}
      </p>
    </article>
  );
}
