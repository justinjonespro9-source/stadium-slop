import Image from "next/image";
import Link from "next/link";

import type { VenueReviewerHistoryReview } from "@/lib/venue-reviewer-history";
import { slopScoreDisplay } from "@/lib/slop-card-display";

type VenueReviewerHistoryListProps = {
  reviews: VenueReviewerHistoryReview[];
};

export function VenueReviewerHistoryList({ reviews }: VenueReviewerHistoryListProps) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.45)] px-4 py-6 text-center text-sm text-[var(--slop-cream-dim)]">
        No active reviews at this venue yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id}>
          <Link
            href={review.itemPath}
            className="group flex gap-3 rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.72)] p-3 transition hover:border-[var(--slop-gold)]/35 sm:p-4"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--slop-line)] bg-[var(--slop-navy-deep)]">
              {review.photoUrl ? (
                <Image
                  src={review.photoUrl}
                  alt={review.photoAlt}
                  fill
                  className="object-cover object-center"
                  sizes="64px"
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center text-2xl"
                  aria-hidden
                >
                  {review.photoPlaceholder ?? "📸"}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-[var(--slop-cream)] group-hover:text-[var(--slop-gold-bright)]">
                {review.foodName}
              </p>
              <p className="mt-0.5 text-xs text-[var(--slop-cream-dim)]">
                {review.dateLabel}
                {review.verifiedGameDay ? " · verified at park" : null}
              </p>
              <p className="mt-1 text-[0.65rem] font-bold text-[var(--slop-cream-muted)]">
                View item →
              </p>
            </div>
            <div
              className="flex min-w-[3.25rem] shrink-0 flex-col items-center justify-center rounded-lg border border-[var(--slop-orange)]/40 bg-[color:rgba(255,159,28,0.1)] px-2.5 py-1.5"
              aria-label={`Slop score ${slopScoreDisplay(review.slopScore)}`}
            >
              <span className="text-lg font-black tabular-nums leading-none text-[var(--slop-orange)]">
                {slopScoreDisplay(review.slopScore)}
              </span>
              <span className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                Slop
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
