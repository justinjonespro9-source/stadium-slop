import Link from "next/link";
import type { ReactNode } from "react";

export type ActivityReviewCardProps = {
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
};

export function ActivityReviewCard({
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
  canEditToday
}: ActivityReviewCardProps) {
  const itemUrl = `/venues/${venueSlug}/${foodSlug}`;
  const reviewUrl = `${itemUrl}/review`;

  return (
    <article className="group rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.72)] p-3 transition hover:border-[var(--slop-gold)]/35 sm:p-4">
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
          <MetaChip variant="gold">Verified at park</MetaChip>
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

      <CardActions
        canEditToday={canEditToday}
        reviewUrl={reviewUrl}
        itemUrl={itemUrl}
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
        <h3 className="truncate text-sm font-black leading-tight text-[var(--slop-cream)] sm:text-base">
          {foodName}
        </h3>
        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--slop-gold-dim)]">
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
      className="flex min-w-[3.25rem] shrink-0 flex-col items-center justify-center rounded-lg border border-[var(--slop-orange)]/40 bg-[color:rgba(255,159,28,0.1)] px-2.5 py-1.5"
      aria-label={`Slop score ${score.toFixed(1)}`}
    >
      <span className="text-lg font-black tabular-nums leading-none text-[var(--slop-orange)]">
        {score.toFixed(1)}
      </span>
      <span className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
        Slop
      </span>
    </div>
  );
}

function CardActions({
  canEditToday,
  reviewUrl,
  itemUrl
}: {
  canEditToday: boolean;
  reviewUrl: string;
  itemUrl: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {canEditToday ? (
        <Link
          href={reviewUrl}
          className="inline-flex min-h-9 items-center rounded-xl border border-[var(--slop-orange)] bg-[color:rgba(255,159,28,0.12)] px-3.5 py-2 text-xs font-black uppercase tracking-[0.06em] text-[var(--slop-orange)] transition hover:bg-[color:rgba(255,159,28,0.22)]"
        >
          Edit today&apos;s review
        </Link>
      ) : null}
      <Link
        href={itemUrl}
        className="inline-flex min-h-9 items-center rounded-xl border border-[var(--slop-line-strong)] px-3.5 py-2 text-xs font-black uppercase tracking-[0.06em] text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)] hover:text-[var(--slop-cream)]"
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
  variant?: "default" | "gold" | "muted";
  title?: string;
}) {
  const styles =
    variant === "gold"
      ? "border-[var(--slop-gold)]/40 bg-[color:rgba(244,179,33,0.12)] text-[var(--slop-gold-bright)]"
      : variant === "muted"
        ? "border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.5)] text-[var(--slop-cream-muted)]"
        : "border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.45)] text-[var(--slop-cream-dim)]";

  return (
    <li
      className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold sm:text-[0.7rem] ${styles}`}
      title={title}
    >
      {children}
    </li>
  );
}
