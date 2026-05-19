import type { FanFavoriteBadge } from "@/lib/fan-favorite-awards";

type FanFavoriteBadgeChipsProps = {
  badges: FanFavoriteBadge[];
  /** Row chips are slightly tighter than hero chips. */
  variant?: "row" | "hero";
  className?: string;
};

export function FanFavoriteBadgeChips({
  badges,
  variant = "row",
  className = ""
}: FanFavoriteBadgeChipsProps) {
  if (badges.length === 0) {
    return null;
  }

  const textClass =
    variant === "row"
      ? "text-[0.55rem] tracking-[0.07em] sm:text-[0.58rem]"
      : "text-[0.65rem] tracking-[0.08em] sm:text-xs";

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badges.map((badge) => (
        <span
          key={`${badge.scope}-${badge.rank}`}
          className={`inline-flex max-w-full rounded border border-[color:rgba(244,179,33,0.45)] bg-[color:rgba(244,179,33,0.1)] px-1.5 py-0.5 font-black uppercase text-[var(--slop-gold-bright)] ${textClass}`}
        >
          <span className="truncate">{badge.label}</span>
        </span>
      ))}
    </div>
  );
}
