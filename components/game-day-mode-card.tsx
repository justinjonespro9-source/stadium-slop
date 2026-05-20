import type { Game } from "@prisma/client";

import {
  formatGameDayDateTime,
  formatGameDayPollingWindowHoursLabel,
  formatGameDayPollingWindowRange,
  formatGameDayTime,
  formatHomeTeamLabel,
  isGameDayActive
} from "@/lib/game-day";

type GameDayModeCardProps = {
  homeTeamLabel: string;
  activeGame: Game | null;
  upcomingGame: Game | null;
  now?: Date;
};

export function GameDayModeCard({
  homeTeamLabel,
  activeGame,
  upcomingGame,
  now = new Date()
}: GameDayModeCardProps) {
  if (activeGame && isGameDayActive(activeGame, now)) {
    const matchup = `${activeGame.awayTeamName} at ${homeTeamLabel}`;
    const windowRange = formatGameDayPollingWindowRange(
      activeGame.pollingOpensAt,
      activeGame.pollingClosesAt
    );
    const startLabel = formatGameDayTime(activeGame.startsAt);

    return (
      <article
        className="rounded-2xl border border-[color:rgba(244,179,33,0.35)] bg-[linear-gradient(135deg,rgba(244,179,33,0.12),rgba(6,15,24,0.85))] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)] sm:rounded-3xl sm:p-5"
        aria-labelledby="game-day-mode-heading"
      >
        <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-bright)]">
          Game Day Mode
        </p>
        <h2
          id="game-day-mode-heading"
          className="mt-1 text-lg font-black leading-snug text-[var(--slop-cream)] sm:text-xl"
        >
          {matchup}
        </h2>
        <p className="mt-1.5 text-sm text-[var(--slop-cream-muted)]">
          First pitch · {startLabel}
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--slop-gold-dim)]">
          Certified review window · {windowRange}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--slop-cream-dim)]">
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
    <article className="rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="text-[0.6rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
        Next home game
      </p>
      <p className="mt-0.5 text-sm font-bold text-[var(--slop-cream)]">
        {matchup} — {formatGameDayDateTime(upcomingGame.startsAt)}
      </p>
    </article>
  );
}
