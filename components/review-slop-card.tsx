import Image from "next/image";
import type { ReactNode } from "react";

import { SlopCardHighlightChips } from "@/components/slop-card-highlight-chips";
import type { FoodReview } from "@/lib/sample-data";
import { normalizePublicImageUrl } from "@/lib/image-url";
import { slopScoreDisplay } from "@/lib/slop-card-display";

/** Portrait Slop Card — optimized for mobile screenshots and fan sharing. */
export function ReviewSlopCard({
  review,
  itemName,
  venueName,
  metaLine,
  highlightLabels,
  photoUrl,
  photoAlt,
  photoPlaceholderEmoji,
  napkinEligible,
  signalLine,
  helpfulSlot,
  reportSlot,
  duplicateHeroBadge
}: {
  review: FoodReview;
  itemName: string;
  venueName: string;
  /** e.g. venue · section · game day */
  metaLine: string;
  highlightLabels: string[];
  photoUrl: string | undefined;
  photoAlt: string;
  photoPlaceholderEmoji?: string;
  napkinEligible: boolean;
  signalLine?: string;
  helpfulSlot: ReactNode;
  reportSlot: ReactNode;
  duplicateHeroBadge?: boolean;
}) {
  const u = normalizePublicImageUrl(photoUrl);
  const initialsSource = (review.reviewerName ?? review.reviewerHandle ?? "?").trim();
  const initials =
    initialsSource.length > 0
      ? initialsSource
          .split(/\s+/)
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?";

  const showFanScout = review.verifiedGameDay || review.helpfulLikes >= 2;
  const chips =
    highlightLabels.length > 0
      ? highlightLabels
      : signalLine
        ? [signalLine]
        : [];

  return (
    <article className="slop-card-shell w-[min(100%,22rem)] max-w-full min-w-0 shrink-0 snap-center sm:w-[20rem]">
      <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[color:rgba(244,179,33,0.38)] bg-[var(--slop-navy-deep)] shadow-[0_20px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(196,30,58,0.18),inset_0_1px_0_rgba(255,255,255,0.07)]">
        {/* Scoreboard header strip */}
        <div
          className="relative border-b border-[color:rgba(244,179,33,0.22)] bg-[linear-gradient(105deg,rgba(198,61,47,0.35)_0%,rgba(11,27,43,0.95)_38%,rgba(244,179,33,0.22)_100%)] px-3 pb-2.5 pt-2.5"
          aria-hidden={false}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-12deg, transparent, transparent 6px, rgba(255,255,255,0.9) 6px, rgba(255,255,255,0.9) 7px)"
            }}
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-[var(--slop-gold-bright)]">
                Stadium Slop
              </p>
              <p className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                Slop Scorecard
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[color:rgba(244,179,33,0.35)] bg-[color:rgba(244,179,33,0.1)] px-2 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.1em] text-[var(--slop-gold-dim)]">
              Fan-powered
            </span>
          </div>
          <h3 className="relative mt-2 line-clamp-2 text-base font-black leading-tight tracking-tight text-[var(--slop-cream)] sm:text-[1.05rem]">
            {itemName}
          </h3>
          <p className="relative mt-0.5 truncate text-[0.7rem] font-bold text-[var(--slop-cream-muted)] sm:text-xs">
            {venueName}
          </p>
          <p className="relative mt-1 line-clamp-2 text-[0.62rem] font-semibold leading-snug text-[var(--slop-cream-dim)]">
            {metaLine}
          </p>
        </div>

        {/* Fan photo — portrait-friendly */}
        <div className="relative aspect-[4/5] bg-[#04080f]">
          {u ? (
            <Image
              src={u}
              alt={photoAlt}
              fill
              className="object-contain object-center"
              sizes="(max-width: 640px) 92vw, 20rem"
              priority={false}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--slop-line-strong)] bg-[var(--slop-surface)] text-3xl shadow-inner"
                aria-hidden
              >
                {photoPlaceholderEmoji ?? "📸"}
              </span>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                Fan photo loading
              </p>
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04080f] via-transparent to-[#04080f]/40"
            aria-hidden
          />

          <div className="pointer-events-none absolute left-2.5 top-2.5 flex max-w-[78%] flex-col gap-1">
            {review.verifiedGameDay ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-md border border-emerald-400/55 bg-[rgba(4,12,8,0.88)] px-2 py-1 text-[0.55rem] font-black uppercase tracking-[0.1em] text-emerald-100 shadow-[0_4px_12px_rgba(0,0,0,0.45)]">
                <span
                  className="slop-live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
                  aria-hidden
                />
                Verified at venue
              </span>
            ) : (
              <span className="inline-flex w-fit rounded-md border border-[var(--slop-line-strong)] bg-[rgba(4,10,18,0.88)] px-2 py-1 text-[0.55rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-muted)]">
                Fan review
              </span>
            )}
            {duplicateHeroBadge ? (
              <span className="inline-flex w-fit rounded-md border border-white/25 bg-black/75 px-2 py-0.5 text-[0.52rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-muted)]">
                Hero match
              </span>
            ) : null}
          </div>

          <div className="pointer-events-none absolute right-2.5 top-2.5">
            <div className="rounded-xl border-2 border-[var(--slop-ink)] bg-[linear-gradient(180deg,var(--slop-gold-bright)_0%,var(--slop-gold)_100%)] px-2.5 py-2 text-center shadow-[0_6px_20px_rgba(0,0,0,0.5)]">
              <p className="text-[0.45rem] font-black uppercase tracking-[0.14em] text-[var(--slop-navy)]">
                Slop
              </p>
              <p className="text-xl font-black tabular-nums leading-none text-[var(--slop-ink)] sm:text-2xl">
                {slopScoreDisplay(review.slopScore)}
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-end gap-2">
            <div className="relative">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--slop-gold)]/75 bg-[var(--slop-navy-deep)] text-xs font-black text-[var(--slop-cream)] shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
                title={review.reviewerName ?? "Fan"}
              >
                {initials}
              </div>
              {showFanScout ? (
                <span className="absolute -bottom-1 left-1/2 w-max max-w-[5.5rem] -translate-x-1/2 rounded border border-[var(--slop-gold)]/40 bg-[var(--slop-ink)] px-1 py-px text-[0.45rem] font-black uppercase tracking-[0.08em] text-[var(--slop-gold-bright)]">
                  Fan Scout
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--slop-line-strong)] bg-[linear-gradient(180deg,rgba(8,18,28,0.98),rgba(4,10,18,1))] px-3 py-2.5">
          <SlopCardHighlightChips labels={chips} className="mb-2" />

          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="text-[0.72rem] font-black text-[var(--slop-cream)]">
              {review.reviewerName ?? "Fan"}
            </span>
            {review.reviewerHandle ? (
              <span className="text-[0.68rem] font-bold text-[var(--slop-cream-dim)]">
                @{review.reviewerHandle.replace(/^@/, "")}
              </span>
            ) : null}
          </div>

          <div className="mt-2 grid min-w-0 grid-cols-3 gap-1 rounded-lg border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.65)] px-2 py-1.5 text-center">
            <div className="min-w-0">
              <p className="text-[0.48rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                Slop
              </p>
              <p className="text-sm font-black tabular-nums text-[var(--slop-orange)]">
                {slopScoreDisplay(review.slopScore)}
              </p>
            </div>
            <div className="min-w-0 border-x border-[var(--slop-line)]">
              <p className="text-[0.48rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                Napkins
              </p>
              <p className="text-sm font-black tabular-nums text-[var(--slop-cream)]">
                {napkinEligible ? `${review.napkinRating}/5` : "—"}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[0.48rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                Helpful
              </p>
              <p className="text-sm font-black tabular-nums text-[var(--slop-cream)]">
                {review.helpfulLikes}
              </p>
            </div>
          </div>

          {review.note ? (
            <p className="mt-2 line-clamp-3 text-[0.68rem] leading-snug text-[var(--slop-cream-muted)]">
              &ldquo;{review.note}&rdquo;
            </p>
          ) : null}

          <div className="mt-2.5 space-y-2 border-t border-[var(--slop-line)] pt-2.5">
            {helpfulSlot}
            {reportSlot}
          </div>
        </div>
      </div>
    </article>
  );
}
