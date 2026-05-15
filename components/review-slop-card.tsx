import Image from "next/image";
import type { ReactNode } from "react";

import type { FoodReview } from "@/lib/sample-data";
import { normalizePublicImageUrl } from "@/lib/image-url";

/** Visual-first collectible-style fan photo card; details + actions below for mobile a11y. */
export function ReviewSlopCard({
  review,
  photoUrl,
  photoAlt,
  napkinEligible,
  captionLine,
  signalLine,
  helpfulSlot,
  reportSlot,
  duplicateHeroBadge
}: {
  review: FoodReview;
  photoUrl: string | undefined;
  photoAlt: string;
  napkinEligible: boolean;
  captionLine: string;
  /** Fan signals one-liner (replay / price consensus). */
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

  return (
    <article className="w-[min(100%,18rem)] shrink-0 snap-start sm:w-[18.5rem]">
      <div className="overflow-hidden rounded-xl border-2 border-[var(--slop-gold)]/45 bg-[var(--slop-navy-deep)] shadow-[0_14px_36px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(196,30,58,0.22),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="relative aspect-[4/3] bg-[#050a12]">
          {u ? (
            <Image
              src={u}
              alt={photoAlt}
              fill
              className="object-contain object-center"
              sizes="(max-width: 640px) 90vw, 18.5rem"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[0.65rem] font-bold text-[var(--slop-cream-dim)]">
              Photo unavailable
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35"
            aria-hidden
          />

          <div className="pointer-events-none absolute left-2 top-2 flex max-w-[85%] flex-wrap gap-1">
            {review.verifiedGameDay ? (
              <span className="rounded border border-emerald-500/50 bg-black/70 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-emerald-100">
                Game day
              </span>
            ) : null}
            <span className="rounded border border-[var(--slop-gold)]/50 bg-black/70 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-[var(--slop-gold-bright)]">
              Verified
            </span>
            {duplicateHeroBadge ? (
              <span className="rounded border border-white/20 bg-black/70 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-muted)]">
                Hero match
              </span>
            ) : null}
          </div>

          <div className="pointer-events-none absolute right-2 top-2">
            <span className="inline-flex min-w-[2.75rem] items-center justify-center rounded-lg border-2 border-[var(--slop-ink)] bg-[var(--slop-orange)] px-2 py-1 text-sm font-black tabular-nums leading-none text-[var(--slop-ink)] shadow-sm">
              {review.slopScore.toFixed(1)}
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-2 left-2 flex items-end gap-2">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--slop-gold)]/70 bg-[var(--slop-navy-deep)] text-xs font-black text-[var(--slop-cream)] shadow-md"
              title={review.reviewerName ?? "Fan"}
              aria-hidden
            >
              {initials}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 px-2 pb-2 pt-8">
            <p className="line-clamp-2 text-[0.7rem] font-bold leading-snug text-[var(--slop-cream)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {captionLine}
            </p>
          </div>
        </div>

        {/* Compact “card back” — always visible; no flip (mobile-safe). */}
        <div className="border-t border-[var(--slop-line-strong)] bg-[linear-gradient(180deg,rgba(6,15,24,0.95),rgba(4,10,18,0.98))] px-2.5 py-2">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[0.68rem] text-[var(--slop-cream-muted)]">
            <span className="font-black text-[var(--slop-cream)]">{review.reviewerName ?? "Fan"}</span>
            {review.reviewerHandle ? (
              <span className="text-[var(--slop-cream-dim)]">@{review.reviewerHandle}</span>
            ) : null}
            <span className="text-[var(--slop-cream-dim)]">· {review.dateLabel}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[var(--slop-cream-dim)]">
            <span>
              Slop{" "}
              <span className="tabular-nums text-[var(--slop-orange)]">
                {review.slopScore.toFixed(1)}
              </span>
            </span>
            <span className="opacity-40" aria-hidden>
              |
            </span>
            <span>
              Napkins{" "}
              <span className="tabular-nums text-[var(--slop-cream)]">
                {napkinEligible ? `${review.napkinRating}/5` : "—"}
              </span>
            </span>
            <span className="opacity-40" aria-hidden>
              |
            </span>
            <span>
              Helpful{" "}
              <span className="tabular-nums text-[var(--slop-cream)]">{review.helpfulLikes}</span>
            </span>
          </div>
          {signalLine ? (
            <p className="mt-1 line-clamp-2 text-[0.62rem] font-bold leading-snug text-[var(--slop-gold-dim)]">
              {signalLine}
            </p>
          ) : null}
          {review.note ? (
            <p className="mt-1.5 line-clamp-2 text-[0.65rem] leading-snug text-[var(--slop-cream-muted)]">
              {review.note}
            </p>
          ) : null}
          <div className="mt-2 space-y-2 border-t border-[var(--slop-line)] pt-2">
            {helpfulSlot}
            {reportSlot}
          </div>
        </div>
      </div>
    </article>
  );
}
