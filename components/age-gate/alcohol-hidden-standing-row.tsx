"use client";

export const ALCOHOL_HIDDEN_MESSAGE =
  "Alcohol-related listings are hidden until age confirmation.";

export function AlcoholHiddenStandingRow({ rank }: { rank: number }) {
  return (
    <div
      className="relative block border-b border-[color:rgba(245,233,208,0.07)] bg-[color:rgba(6,15,24,0.55)] last:border-b-0"
      aria-label={`Rank ${rank}, alcohol listing hidden`}
    >
      <article className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-2 px-2.5 py-2.5 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-2.5 sm:px-3 sm:py-3">
        <p className="select-none text-center font-mono text-base font-black tabular-nums text-[var(--slop-cream-dim)] sm:text-lg">
          {rank}
        </p>
        <p className="text-[0.7rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs">
          {ALCOHOL_HIDDEN_MESSAGE}
        </p>
        <p className="text-right text-sm font-black text-[var(--slop-cream-dim)] opacity-50">
          —
        </p>
      </article>
    </div>
  );
}
