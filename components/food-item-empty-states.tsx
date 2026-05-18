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

export function FanSignalsPendingPanel() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.65)] px-3 py-2">
      <p className="text-xs font-bold text-[var(--slop-cream-muted)]">
        Replay / price breakdown unlocks after reviews.
      </p>
    </div>
  );
}

export function GameDayFreshPendingBlock() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--slop-line-strong)] px-2.5 py-1.5 text-xs text-[var(--slop-cream-dim)]">
      <span className="font-bold text-[var(--slop-cream-muted)]">Fresh:</span> no
      verified takes today yet.
    </div>
  );
}

export function PhotoBackedReviewsEmpty({
  reviewHref,
  venueSlug,
  foodSlug
}: {
  reviewHref: string;
  venueSlug: string;
  foodSlug: string;
}) {
  const loginNext = encodeURIComponent(`/venues/${venueSlug}/${foodSlug}/review`);
  return (
    <div className="rounded-2xl border border-dashed border-[color:rgba(244,179,33,0.22)] bg-[color:rgba(6,15,24,0.55)] px-4 py-4 text-center">
      <p className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
        Slop Cards
      </p>
      <p className="mt-1 text-sm font-bold text-[var(--slop-cream)]">No fan photo cards yet</p>
      <p className="mt-1 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
        Be the first screenshot-worthy review at this stand.
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Link
          href={reviewHref}
          className="inline-flex rounded-full border border-[var(--slop-orange)] bg-[var(--slop-orange)] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--slop-ink)]"
        >
          Add review
        </Link>
        <Link
          href={`/login?next=${loginNext}`}
          className="inline-flex rounded-full border border-[var(--slop-line-strong)] px-3 py-1 text-[0.65rem] font-bold text-[var(--slop-cream-dim)]"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
