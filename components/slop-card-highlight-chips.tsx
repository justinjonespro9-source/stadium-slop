import {
  highlightToneForLabel,
  type SlopCardHighlightTone
} from "@/lib/slop-card-display";

const toneClass: Record<SlopCardHighlightTone, string> = {
  gold: "border-[var(--slop-gold)]/50 bg-[color:rgba(244,179,33,0.14)] text-[var(--slop-gold-bright)]",
  orange:
    "border-[var(--slop-orange)]/45 bg-[color:rgba(255,159,28,0.12)] text-[var(--slop-orange)]",
  emerald:
    "border-emerald-400/40 bg-emerald-950/40 text-emerald-100",
  cream:
    "border-[var(--slop-line-strong)] bg-[color:rgba(245,233,208,0.06)] text-[var(--slop-cream-muted)]"
};

export function SlopCardHighlightChips({
  labels,
  className = ""
}: {
  labels: string[];
  className?: string;
}) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <ul
      className={`flex flex-wrap gap-1 ${className}`}
      aria-label="Fan signal highlights"
    >
      {labels.map((label) => {
        const tone = highlightToneForLabel(label);
        const isLive = label.toLowerCase().includes("trending");
        return (
          <li key={label}>
            <span
              className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.08em] sm:text-[0.6rem] ${toneClass[tone]}`}
            >
              {isLive ? (
                <span
                  className="slop-live-dot inline-block h-1 w-1 shrink-0 rounded-full bg-emerald-400"
                  aria-hidden
                />
              ) : null}
              <span className="truncate">{label}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
