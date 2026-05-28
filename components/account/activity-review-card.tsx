import Link from "next/link";
import type { ReactNode } from "react";

import { ScorecardShareActions } from "@/components/scorecard-share-actions";

export type ActivityReviewCardProps = {
  reviewId: string;
  foodName: string;
  venueName: string;
  venueSlug: string;
  foodSlug: string;
  slopScore: number;
  napkinRating: number;
  dateLine: string;
  photoCount: number;
  helpfulLikes: number;
  verifiedGameDay: boolean;
  canEditToday: boolean;
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
};

export function ActivityReviewCard({
  reviewId,
  foodName,
  venueName,
  venueSlug,
  foodSlug,
  slopScore,
  napkinRating,
  dateLine,
  photoCount,
  helpfulLikes,
  verifiedGameDay,
  canEditToday,
  shareUrl,
  shareTitle,
  shareDescription
}: ActivityReviewCardProps) {
  const itemUrl = `/venues/${venueSlug}/${foodSlug}`;
  const reviewUrl = `${itemUrl}/review`;
  const scorecardUrl = `/scorecards/${encodeURIComponent(reviewId)}`;

  return (
    <article className="media-content-card group p-3 transition hover:border-[var(--media-orange)]/35 sm:p-4">
      <ReviewCardHeader
        foodName={foodName}
        venueName={venueName}
        slopScore={slopScore}
      />

      <ul
        className="mt-2.5 flex flex-wrap gap-1.5"
        aria-label="Review metadata"
      >
        <MetaChip>{dateLine}</MetaChip>
        <MetaChip>{napkinRating}/5 napkins</MetaChip>
        {verifiedGameDay ? (
          <MetaChip variant="accent">Verified at park</MetaChip>
        ) : null}
        {photoCount > 0 ? (
          <MetaChip variant="muted" title="Review includes a photo">
            Photo
          </MetaChip>
        ) : null}
        <MetaChip>
          {helpfulLikes} helpful {helpfulLikes === 1 ? "like" : "likes"}
        </MetaChip>
      </ul>

      <div className="mt-3">
        <ScorecardShareActions
          shareUrl={shareUrl}
          shareTitle={shareTitle}
          shareDescription={shareDescription}
        />
      </div>

      <CardActions
        canEditToday={canEditToday}
        reviewUrl={reviewUrl}
        itemUrl={itemUrl}
        scorecardUrl={scorecardUrl}
      />
    </article>
  );
}

function ReviewCardHeader({
  foodName,
  venueName,
  slopScore
}: {
  foodName: string;
  venueName: string;
  slopScore: number;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-black leading-tight text-[var(--media-ink)] sm:text-base">
          {foodName}
        </h3>
        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--media-orange-deep)]">
          {venueName}
        </p>
      </div>
      <SlopScoreBadge score={slopScore} />
    </div>
  );
}

function SlopScoreBadge({ score }: { score: number }) {
  return (
    <div
      className="flex min-w-[3.25rem] shrink-0 flex-col items-center justify-center rounded-lg border border-[var(--media-orange)]/35 bg-[rgba(255,107,26,0.08)] px-2.5 py-1.5"
      aria-label={`Slop score ${score.toFixed(1)}`}
    >
      <span className="text-lg font-black tabular-nums leading-none text-[var(--media-orange)]">
        {score.toFixed(1)}
      </span>
      <span className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[var(--media-ink-muted)]">
        Slop
      </span>
    </div>
  );
}

function CardActions({
  canEditToday,
  reviewUrl,
  itemUrl,
  scorecardUrl
}: {
  canEditToday: boolean;
  reviewUrl: string;
  itemUrl: string;
  scorecardUrl: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {canEditToday ? (
        <Link
          href={reviewUrl}
          className="media-cta inline-flex min-h-9 items-center rounded-full px-3.5 py-2 text-[0.65rem] font-black uppercase tracking-[0.06em]"
        >
          Edit today&apos;s review
        </Link>
      ) : null}
      <Link
        href={scorecardUrl}
        className="media-secondary-button min-h-9 px-3.5 py-2 text-[0.65rem]"
      >
        View scorecard
      </Link>
      <Link
        href={itemUrl}
        className="media-secondary-button min-h-9 px-3.5 py-2 text-[0.65rem]"
      >
        View item
      </Link>
    </div>
  );
}

function MetaChip({
  children,
  variant = "default",
  title
}: {
  children: ReactNode;
  variant?: "default" | "accent" | "muted";
  title?: string;
}) {
  const styles =
    variant === "accent"
      ? "border-[var(--media-orange)]/35 bg-[rgba(255,107,26,0.1)] text-[var(--media-orange-deep)]"
      : variant === "muted"
        ? "border-[var(--media-border)] bg-[var(--media-surface)] text-[var(--media-ink-muted)]"
        : "border-[var(--media-border)] bg-[var(--media-surface)] text-[var(--media-ink-dim)]";

  return (
    <li
      className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold sm:text-[0.7rem] ${styles}`}
      title={title}
    >
      {children}
    </li>
  );
}
