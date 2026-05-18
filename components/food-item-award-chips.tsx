import type { FoodItemAwardChip } from "@/lib/venue-awards";

const toneClass: Record<FoodItemAwardChip["tone"], string> = {
  gold: "border-[var(--slop-gold)]/45 bg-[color:rgba(244,179,33,0.12)] text-[var(--slop-gold-bright)]",
  orange:
    "border-[var(--slop-orange)]/40 bg-[color:rgba(255,159,28,0.1)] text-[var(--slop-orange)]",
  emerald:
    "border-emerald-400/35 bg-emerald-950/30 text-emerald-200/95",
  cream:
    "border-[var(--slop-line-strong)] bg-[color:rgba(245,233,208,0.06)] text-[var(--slop-cream-muted)]"
};

type FoodItemAwardChipsProps = {
  chips: FoodItemAwardChip[];
};

export function FoodItemAwardChips({ chips }: FoodItemAwardChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <ul
      className="flex flex-wrap gap-1.5"
      aria-label="Fan-powered highlights"
    >
      {chips.map((chip) => (
        <li key={chip.id}>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.08em] sm:text-xs ${toneClass[chip.tone]}`}
          >
            {chip.id === "trending-tonight" ? (
              <span
                className="slop-live-dot inline-block h-1 w-1 rounded-full bg-emerald-400"
                aria-hidden
              />
            ) : null}
            {chip.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
