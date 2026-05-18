import {
  GUIDE_BADGE_LABEL,
  GUIDE_NOTE_BROWSE,
  GUIDE_NOTE_FOOD_MENU,
  GUIDE_NOTE_FOOD_REVIEWS,
  GUIDE_NOTE_FOOD_SCORES,
  GUIDE_NOTE_HOME,
  GUIDE_NOTE_VENUE_BOTTOM,
  GUIDE_NOTE_VENUE_RANKINGS
} from "@/lib/guide-disclaimers";

export type FanPoweredGuidePreset =
  | "home"
  | "browse"
  | "venue-rankings"
  | "venue-bottom"
  | "food-scores"
  | "food-reviews"
  | "food-menu";

const PRESET_LINES: Record<FanPoweredGuidePreset, readonly string[]> = {
  home: [GUIDE_NOTE_HOME],
  browse: [GUIDE_NOTE_BROWSE],
  "venue-rankings": GUIDE_NOTE_VENUE_RANKINGS,
  "venue-bottom": [GUIDE_NOTE_VENUE_BOTTOM],
  "food-scores": [GUIDE_NOTE_FOOD_SCORES],
  "food-reviews": [GUIDE_NOTE_FOOD_REVIEWS],
  "food-menu": [GUIDE_NOTE_FOOD_MENU]
};

type FanPoweredGuideBadgeProps = {
  className?: string;
};

/** Tiny label for rankings, scores, and review blocks. */
export function FanPoweredGuideBadge({ className = "" }: FanPoweredGuideBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-[color:rgba(244,179,33,0.28)] bg-[color:rgba(244,179,33,0.07)] px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.1em] text-[var(--slop-gold-dim)] sm:text-[0.6rem] ${className}`}
    >
      {GUIDE_BADGE_LABEL}
    </span>
  );
}

type FanPoweredGuideNoteProps = {
  preset: FanPoweredGuidePreset;
  className?: string;
  /** Override preset lines when needed. */
  lines?: readonly string[];
  /** Optional “last updated” hook from item/venue data. */
  lastUpdated?: string | null;
};

/**
 * One or two short lines — transparent, not legalese. No modals or banners.
 */
export function FanPoweredGuideNote({
  preset,
  className = "",
  lines,
  lastUpdated
}: FanPoweredGuideNoteProps) {
  const copy = lines ?? PRESET_LINES[preset];
  const timestamp = lastUpdated?.trim();

  if (copy.length === 0 && !timestamp) {
    return null;
  }

  return (
    <div
      className={`text-[0.65rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs sm:leading-relaxed ${className}`}
      role="note"
    >
      {copy.map((line) => (
        <p key={line} className={copy.length > 1 ? "mt-1 first:mt-0" : undefined}>
          {line}
        </p>
      ))}
      {timestamp ? (
        <p className={copy.length > 0 ? "mt-1 text-[var(--slop-cream-dim)]/90" : undefined}>
          <span className="font-semibold text-[var(--slop-cream-muted)]">{timestamp}</span>
        </p>
      ) : null}
    </div>
  );
}
