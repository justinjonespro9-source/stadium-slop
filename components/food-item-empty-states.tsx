import Link from "next/link";

/** Season (or scoped) stats have no fan reviews yet. */
export function isUnratedItemStats(reviewCount: number): boolean {
  return reviewCount === 0;
}

export function FoodItemHeroPlaceholder({
  foodName,
  emoji,
  reviewHref
}: {
  foodName: string;
  emoji: string;
  reviewHref: string;
}) {
  return (
    <div className="flex min-h-[7rem] flex-col items-center justify-center gap-2 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 px-3 py-4 text-center sm:min-h-[8rem]">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--slop-line-strong)] bg-[var(--slop-surface)] text-2xl shadow-[0_2px_12px_rgba(244,179,33,0.12)] sm:h-16 sm:w-16 sm:text-3xl"
        aria-hidden
      >
        {emoji}
      </div>
      <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[var(--slop-orange)]">
        No fan photo
      </p>
      <p className="max-w-[18rem] text-xs font-semibold text-[var(--slop-cream-muted)]">
        {foodName} — add a shot with your review.
      </p>
      <Link
        href={reviewHref}
        className="mt-0.5 inline-flex rounded-full border border-[var(--slop-orange)] bg-[var(--slop-orange)] px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--slop-ink)] transition hover:opacity-95"
      >
        Review + photo
      </Link>
    </div>
  );
}

export function FanSignalsPendingPanel({ tone = "brand" }: { tone?: "brand" | "media" }) {
  const className =
    tone === "media"
      ? "rounded-xl border border-dashed border-[var(--media-border)] bg-[var(--media-surface)] px-3 py-2.5"
      : "rounded-xl border border-dashed border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.65)] px-3 py-2";
  const textClass =
    tone === "media" ? "text-xs font-bold text-[var(--media-ink-muted)]" : "text-xs font-bold text-[var(--slop-cream-muted)]";

  return (
    <div className={className}>
      <p className={textClass}>Replay / price breakdown unlocks after reviews.</p>
    </div>
  );
}

export function GameDayFreshPendingBlock({ tone = "brand" }: { tone?: "brand" | "media" }) {
  const className =
    tone === "media"
      ? "rounded-xl border border-dashed border-[var(--media-border)] bg-[var(--media-surface)] px-3 py-2 text-xs text-[var(--media-ink-muted)]"
      : "rounded-lg border border-dashed border-[var(--slop-line-strong)] px-2.5 py-1.5 text-xs text-[var(--slop-cream-dim)]";
  const strongClass =
    tone === "media" ? "font-bold text-[var(--media-ink)]" : "font-bold text-[var(--slop-cream-muted)]";

  return (
    <div className={className}>
      <span className={strongClass}>Fresh:</span> no verified takes today yet.
    </div>
  );
}

export function PhotoBackedReviewsEmpty({
  reviewHref,
  venueSlug,
  foodSlug,
  tone = "brand"
}: {
  reviewHref: string;
  venueSlug: string;
  foodSlug: string;
  tone?: "brand" | "media";
}) {
  const loginNext = encodeURIComponent(`/venues/${venueSlug}/${foodSlug}/review`);
  const shellClass =
    tone === "media"
      ? "media-content-card rounded-2xl px-4 py-5 text-center sm:px-5"
      : "rounded-2xl border border-dashed border-[color:rgba(244,179,33,0.22)] bg-[color:rgba(6,15,24,0.55)] px-4 py-4 text-center";

  return (
    <div className={shellClass}>
      <p
        className={
          tone === "media"
            ? "media-section-eyebrow"
            : "text-[0.55rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]"
        }
      >
        Slop Scorecards
      </p>
      <p
        className={`mt-1 font-bold ${
          tone === "media" ? "text-base text-[var(--media-ink)]" : "text-sm text-[var(--slop-cream)]"
        }`}
      >
        No fan scorecards yet
      </p>
      <p
        className={`mt-1 leading-snug ${
          tone === "media"
            ? "text-[0.75rem] text-[var(--media-ink-muted)]"
            : "text-[0.65rem] text-[var(--slop-cream-dim)]"
        }`}
      >
        Be the first screenshot-worthy review at this stand.
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Link
          href={reviewHref}
          className={
            tone === "media"
              ? "media-primary-button px-4 py-2 text-xs"
              : "inline-flex rounded-full border border-[var(--slop-orange)] bg-[var(--slop-orange)] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--slop-ink)]"
          }
        >
          Add review
        </Link>
        <Link
          href={`/login?next=${loginNext}`}
          className={
            tone === "media"
              ? "media-cta-outline px-4 py-2 text-xs"
              : "inline-flex rounded-full border border-[var(--slop-line-strong)] px-3 py-1 text-[0.65rem] font-bold text-[var(--slop-cream-dim)]"
          }
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
