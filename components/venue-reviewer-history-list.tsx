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
      <p className="media-panel-card px-4 py-6 text-center text-sm text-[var(--media-ink-muted)]">
        No active reviews at this venue yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {reviews.map((review) => (
        <li key={review.id}>
          <Link href={review.itemPath} className="media-card flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--media-border)] bg-[var(--media-surface)]">
              {review.photoUrl ? (
                <Image
                  src={review.photoUrl}
                  alt={review.photoAlt}
                  fill
                  className="object-cover object-center"
                  sizes="64px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl" aria-hidden>
                  {review.photoPlaceholder ?? "📸"}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-[var(--media-ink)]">{review.foodName}</p>
              <p className="mt-0.5 text-xs text-[var(--media-ink-muted)]">
                {review.dateLabel}
                {review.verifiedGameDay ? " · verified at park" : null}
              </p>
              <p className="mt-1 text-[0.65rem] font-bold text-[var(--media-orange-deep)]">
                View item →
              </p>
            </div>
            <div
              className="flex min-w-[3.25rem] shrink-0 flex-col items-center justify-center rounded-lg border border-[rgba(255,107,26,0.28)] bg-[rgba(255,107,26,0.08)] px-2 py-1.5"
              aria-label={`Slop score ${slopScoreDisplay(review.slopScore)}`}
            >
              <span className="text-lg font-black tabular-nums leading-none text-[var(--media-orange)]">
                {slopScoreDisplay(review.slopScore)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
