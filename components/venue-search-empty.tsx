import {
  VENUE_SEARCH_EMPTY_HEADLINE,
  VENUE_SEARCH_EMPTY_HINT,
  VENUE_SEARCH_EMPTY_FUTURE
} from "@/lib/venue-search";

/** Shared empty UI for homepage + /venues venue search */
export function VenueSearchEmpty({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      className={`rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.65)] px-3 py-3.5 text-center sm:py-4 ${className}`}
    >
      <p className="text-sm font-black text-[var(--slop-cream)]">{VENUE_SEARCH_EMPTY_HEADLINE}</p>
      <p className="mt-1 text-xs leading-snug text-[var(--slop-cream-muted)]">{VENUE_SEARCH_EMPTY_HINT}</p>
      <p className="mt-2 border-t border-[var(--slop-line)] pt-2 text-[0.65rem] italic text-[var(--slop-cream-dim)]">
        {VENUE_SEARCH_EMPTY_FUTURE}
      </p>
    </div>
  );
}
