import {
  VENUE_SEARCH_EMPTY_HEADLINE,
  VENUE_SEARCH_EMPTY_HINT,
  VENUE_SEARCH_EMPTY_FUTURE
} from "@/lib/venue-search";

/** Shared empty UI for homepage + /venues venue search */
export function VenueSearchEmpty({
  className = "",
  tone = "brand"
}: {
  className?: string;
  tone?: "brand" | "media";
}) {
  const shellClass =
    tone === "media"
      ? "media-panel-card rounded-xl px-4 py-5 text-center"
      : `rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.65)] px-3 py-3.5 text-center sm:py-4 ${className}`;

  const titleClass =
    tone === "media" ? "text-sm font-black text-[var(--media-ink)]" : "text-sm font-black text-[var(--slop-cream)]";
  const hintClass =
    tone === "media"
      ? "mt-1 text-xs leading-snug text-[var(--media-ink-muted)]"
      : "mt-1 text-xs leading-snug text-[var(--slop-cream-muted)]";
  const futureClass =
    tone === "media"
      ? "mt-2 border-t border-[var(--media-border)] pt-2 text-[0.65rem] italic text-[var(--media-ink-dim)]"
      : "mt-2 border-t border-[var(--slop-line)] pt-2 text-[0.65rem] italic text-[var(--slop-cream-dim)]";

  return (
    <div role="status" className={tone === "media" ? `${shellClass} ${className}` : shellClass}>
      <p className={titleClass}>{VENUE_SEARCH_EMPTY_HEADLINE}</p>
      <p className={hintClass}>{VENUE_SEARCH_EMPTY_HINT}</p>
      <p className={futureClass}>{VENUE_SEARCH_EMPTY_FUTURE}</p>
    </div>
  );
}
