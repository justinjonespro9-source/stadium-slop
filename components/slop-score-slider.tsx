"use client";

import { useId, useState } from "react";

import { slopScoreDisplay } from "@/lib/slop-card-display";
import {
  SLOP_SCORE_DEFAULT,
  SLOP_SCORE_MAX,
  SLOP_SCORE_MIN,
  SLOP_SCORE_STEP,
  clampSlopScore
} from "@/lib/review-scorecard";

type SlopScoreSliderProps = {
  name?: string;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
};

export function SlopScoreSlider({
  name = "slopScore",
  defaultValue = SLOP_SCORE_DEFAULT,
  onValueChange
}: SlopScoreSliderProps) {
  const labelId = useId();
  const [value, setValue] = useState(() => clampSlopScore(defaultValue));

  function handleChange(next: number) {
    const clamped = clampSlopScore(next);
    setValue(clamped);
    onValueChange?.(clamped);
  }

  return (
    <div className="mt-3">
      <div
        className="flex flex-col items-center rounded-2xl border border-[var(--slop-line)] bg-black px-4 py-5"
        aria-labelledby={labelId}
      >
        <p id={labelId} className="sr-only">
          Slop Score from {SLOP_SCORE_MIN} to {SLOP_SCORE_MAX}
        </p>
        <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-zinc-500">
          Slop Score
        </p>
        <p
          className="mt-1 text-5xl font-black tabular-nums leading-none tracking-tight text-[var(--slop-orange)] sm:text-6xl"
          aria-live="polite"
          aria-atomic
        >
          {slopScoreDisplay(value)}
        </p>
        <input type="hidden" name={name} value={value.toFixed(1)} readOnly />
        <input
          type="range"
          min={SLOP_SCORE_MIN}
          max={SLOP_SCORE_MAX}
          step={SLOP_SCORE_STEP}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="slop-score-range mt-5 w-full max-w-sm touch-manipulation"
          aria-valuemin={SLOP_SCORE_MIN}
          aria-valuemax={SLOP_SCORE_MAX}
          aria-valuenow={value}
          aria-valuetext={`${slopScoreDisplay(value)} out of 10`}
        />
        <div className="mt-2 flex w-full max-w-sm justify-between text-[0.65rem] font-bold tabular-nums text-zinc-500">
          <span>{SLOP_SCORE_MIN.toFixed(1)}</span>
          <span>{SLOP_SCORE_MAX.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
