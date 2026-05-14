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
    <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-3 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 px-4 py-8 text-center sm:min-h-[14rem]">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--slop-line-strong)] bg-[var(--slop-surface)] text-4xl shadow-[0_4px_20px_rgba(244,179,33,0.15)] sm:h-24 sm:w-24 sm:text-5xl"
        aria-hidden
      >
        {emoji}
      </div>
      <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-[var(--slop-orange)]">
        Stadium Slop
      </p>
      <p className="max-w-xs text-sm font-bold leading-snug text-zinc-200">
        Be the first fan to upload this item.
      </p>
      <p className="max-w-sm text-xs leading-5 text-zinc-500">
        {foodName} is on the board — add a game-day photo when you review so the
        next fan knows what actually showed up.
      </p>
      <div className="mt-1 flex w-full max-w-xs flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href={reviewHref}
          className="inline-flex flex-1 justify-center rounded-full border border-[var(--slop-orange)] bg-[var(--slop-orange)] px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.12em] text-[var(--slop-ink)] transition hover:opacity-95"
        >
          Submit the first review
        </Link>
        <Link
          href={reviewHref}
          className="inline-flex flex-1 justify-center rounded-full border border-zinc-600 bg-zinc-900/80 px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.12em] text-zinc-200 transition hover:border-[var(--slop-orange)] hover:text-white"
        >
          Add the first fan photo
        </Link>
      </div>
    </div>
  );
}

export function FanSignalsPendingPanel() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/80 p-4 sm:p-5">
      <p className="text-sm font-black text-zinc-200">Replay value · Price check</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        No fan breakdown yet. These bars fill in after the first reviews roll in
        — same scorecard, structured labels.
      </p>
    </div>
  );
}

export function GameDayFreshPendingBlock() {
  return (
    <section className="mt-2 rounded-3xl border border-dashed border-zinc-700 bg-zinc-950/60 p-4 sm:p-5">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
        Game Day Fresh
      </p>
      <h2 className="mt-2 text-xl font-black text-zinc-200 sm:text-2xl">
        No Game Day Fresh yet
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Fresh meter runs on today&apos;s verified takes. Submit a review from the
        seats to light this up.
      </p>
    </section>
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
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-5 sm:px-5">
      <p className="text-sm font-black text-zinc-200">No fan photos yet</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Photo-backed cards appear here after fans attach a shot to their review.
        Text-only reviews still move standings.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={reviewHref}
          className="inline-flex justify-center rounded-full border border-[var(--slop-orange)] bg-[var(--slop-orange)] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[var(--slop-ink)]"
        >
          Submit the first review
        </Link>
        <Link
          href={reviewHref}
          className="inline-flex justify-center rounded-full border border-zinc-600 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-zinc-200 hover:border-[var(--slop-orange)]"
        >
          Add the first fan photo
        </Link>
        <Link
          href={`/login?next=${loginNext}`}
          className="inline-flex justify-center rounded-full border border-transparent px-2 py-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-300"
        >
          Sign in first
        </Link>
      </div>
    </div>
  );
}
