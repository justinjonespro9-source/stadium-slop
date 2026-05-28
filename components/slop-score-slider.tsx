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
  tone?: "brand" | "media";
};

export function SlopScoreSlider({
  name = "slopScore",
  defaultValue = SLOP_SCORE_DEFAULT,
  onValueChange,
  tone = "brand"
}: SlopScoreSliderProps) {
  const labelId = useId();
  const [value, setValue] = useState(() => clampSlopScore(defaultValue));
  const isMedia = tone === "media";

  function handleChange(next: number) {
    const clamped = clampSlopScore(next);
    setValue(clamped);
    onValueChange?.(clamped);
  }

  const panelClass = isMedia
    ? "media-review-score-panel"
    : "flex flex-col items-center rounded-2xl border border-[var(--slop-line)] bg-black px-4 py-5";
  const labelClass = isMedia
    ? "text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--media-ink-dim)]"
    : "text-[0.65rem] font-black uppercase tracking-[0.18em] text-zinc-500";
  const valueClass = isMedia
    ? "media-review-score-value"
    : "mt-1 text-5xl font-black tabular-nums leading-none tracking-tight text-[var(--slop-orange)] sm:text-6xl";
  const tickClass = isMedia
    ? "mt-2 flex w-full max-w-xs justify-between text-[0.65rem] font-bold tabular-nums text-[var(--media-ink-dim)]"
    : "mt-2 flex w-full max-w-sm justify-between text-[0.65rem] font-bold tabular-nums text-zinc-500";

  return (
    <div className="mt-3">
      <div className={panelClass} aria-labelledby={labelId}>
        <p id={labelId} className="sr-only">
          Slop Score from {SLOP_SCORE_MIN} to {SLOP_SCORE_MAX}
        </p>
        <p className={labelClass}>Slop Score</p>
        <p className={valueClass} aria-live="polite" aria-atomic>
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
          className="slop-score-range mt-4 w-full max-w-xs touch-manipulation sm:max-w-sm"
          aria-valuemin={SLOP_SCORE_MIN}
          aria-valuemax={SLOP_SCORE_MAX}
          aria-valuenow={value}
          aria-valuetext={`${slopScoreDisplay(value)} out of 10`}
        />
        <div className={tickClass}>
          <span>{SLOP_SCORE_MIN.toFixed(1)}</span>
          <span>{SLOP_SCORE_MAX.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
