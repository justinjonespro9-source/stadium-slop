"use client";

import type { ScorecardSortMode, ScorecardSortOption } from "@/lib/scorecard-carousel-sort";

type SlopScorecardSortBarProps = {
  sort: ScorecardSortMode;
  options: ScorecardSortOption[];
  onSortChange: (mode: ScorecardSortMode) => void;
};

export function SlopScorecardSortBar({
  sort,
  options,
  onSortChange
}: SlopScorecardSortBarProps) {
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
          Sort
        </span>
        <div
          className="flex flex-wrap gap-1.5"
          role="radiogroup"
          aria-label="Sort Slop Scorecards"
        >
          {options.map((option) => {
            const active = sort === option.value;
            return (
              <label
                key={option.value}
                className={`inline-flex min-h-8 cursor-pointer items-center rounded-full border px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.08em] transition ${
                  active
                    ? "border-[var(--slop-gold)] bg-[color:rgba(244,179,33,0.18)] text-[var(--slop-gold-bright)]"
                    : "border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.45)] text-[var(--slop-cream-muted)] hover:border-[var(--slop-gold)]/40"
                }`}
              >
                <input
                  type="radio"
                  name="scorecard-sort"
                  value={option.value}
                  checked={active}
                  onChange={() => onSortChange(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </div>
      {sort === "freshest" ? (
        <p className="text-[0.58rem] leading-snug text-[var(--slop-cream-dim)]">
          Fresh cards show the newest fan takes first.
        </p>
      ) : null}
    </div>
  );
}
