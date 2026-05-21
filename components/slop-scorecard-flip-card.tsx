"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode
} from "react";

import { BrandBadgeIcon } from "@/components/brand-badge-icon";
import { SlopCardHighlightChips } from "@/components/slop-card-highlight-chips";
import type { FoodReview } from "@/lib/sample-data";
import { normalizePublicImageUrl } from "@/lib/image-url";
import { slopScoreDisplay } from "@/lib/slop-card-display";
import {
  getReviewerDisplayName,
  getReviewerHandleLabel,
  getReviewerInitials,
  getSlopScorecardReviewerStatLines,
  showFanScoutBadge
} from "@/lib/slop-scorecard-reviewer";

export const SLOP_SCORECARD_TOGGLE_EVENT = "slop-scorecard-toggle";
export const SLOP_SCORECARD_FRONT_EVENT = "slop-scorecard-front";

export type SlopScorecardFlipCardProps = {
  cardIndex: number;
  review: FoodReview;
  itemName: string;
  venueName: string;
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
};

function ScoreDetailRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.65)] px-2 py-1.5">
      <p className="text-[0.48rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
        {label}
      </p>
      <p className="mt-0.5 text-[0.68rem] font-bold leading-snug text-[var(--slop-cream)]">
        {value}
      </p>
    </div>
  );
}

function ReviewerAvatarBlock({
  review,
  size = "md"
}: {
  review: FoodReview;
  size?: "md" | "lg";
}) {
  const initials = getReviewerInitials(review);
  const handle = getReviewerHandleLabel(review);
  const name = getReviewerDisplayName(review);
  const fanScout = showFanScoutBadge(review);
  const dim = size === "lg" ? "h-14 w-14 text-sm" : "h-11 w-11 text-xs";

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative shrink-0">
        <div
          className={`flex ${dim} items-center justify-center rounded-full border-2 border-[var(--slop-gold)]/75 bg-[var(--slop-navy-deep)] font-black text-[var(--slop-cream)] shadow-[0_4px_14px_rgba(0,0,0,0.45)]`}
        >
          {initials}
        </div>
        {fanScout ? (
          <span className="absolute -bottom-1 left-1/2 w-max max-w-[5.5rem] -translate-x-1/2 rounded border border-[var(--slop-gold)]/40 bg-[var(--slop-ink)] px-1 py-px text-[0.42rem] font-black uppercase tracking-[0.08em] text-[var(--slop-gold-bright)]">
            Fan Scout
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-[var(--slop-cream)]">{name}</p>
        {handle ? (
          <p className="truncate text-[0.68rem] font-bold text-[var(--slop-cream-dim)]">
            {handle}
          </p>
        ) : (
          <p className="text-[0.62rem] font-semibold text-[var(--slop-cream-dim)]">
            Fan reviewer
          </p>
        )}
      </div>
    </div>
  );
}

export function SlopScorecardFlipCard({
  cardIndex,
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
}: SlopScorecardFlipCardProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipRegionId = useId();
  const u = normalizePublicImageUrl(photoUrl);
  const reviewerStats = getSlopScorecardReviewerStatLines(review);
  const chips =
    highlightLabels.length > 0
      ? highlightLabels
      : signalLine
        ? [signalLine]
        : [];

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const showFront = useCallback(() => {
    setIsFlipped(false);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return;
    }
    const onToggle = () => setIsFlipped((prev) => !prev);
    const onFront = () => setIsFlipped(false);
    el.addEventListener(SLOP_SCORECARD_TOGGLE_EVENT, onToggle);
    el.addEventListener(SLOP_SCORECARD_FRONT_EVENT, onFront);
    return () => {
      el.removeEventListener(SLOP_SCORECARD_TOGGLE_EVENT, onToggle);
      el.removeEventListener(SLOP_SCORECARD_FRONT_EVENT, onFront);
    };
  }, []);

  return (
    <article
      ref={rootRef}
      className="slop-scorecard-shell slop-card-shell w-[min(100%,22rem)] max-w-full min-w-0 shrink-0 snap-center sm:w-[20rem]"
      data-slop-scorecard
      data-card-index={cardIndex}
      aria-roledescription="Slop Scorecard"
    >
      <div className={`slop-scorecard-flip-inner ${isFlipped ? "is-flipped" : ""}`}>
        {/* ——— Front ——— */}
        <div
          className="slop-scorecard-face slop-scorecard-face-front relative flex w-full flex-col overflow-hidden rounded-2xl border border-[color:rgba(244,179,33,0.38)] bg-[var(--slop-navy-deep)] shadow-[0_20px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(196,30,58,0.18),inset_0_1px_0_rgba(255,255,255,0.07)]"
          data-face="front"
        >
          <div className="relative flex flex-1 flex-col">
            <div className="relative border-b border-[color:rgba(244,179,33,0.22)] bg-[linear-gradient(105deg,rgba(198,61,47,0.35)_0%,rgba(11,27,43,0.95)_38%,rgba(244,179,33,0.22)_100%)] px-3 py-2">
              <div className="flex items-center gap-2">
                <BrandBadgeIcon size={28} title="Stadium Slop" />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-[var(--slop-gold-bright)]">
                    Stadium Slop
                  </p>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                    Slop Scorecard
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-[color:rgba(244,179,33,0.35)] bg-[color:rgba(244,179,33,0.1)] px-2 py-0.5 text-[0.48rem] font-black uppercase tracking-[0.1em] text-[var(--slop-gold-dim)]">
                  Collectible
                </span>
              </div>
            </div>

            <div className="relative flex-1 bg-[#04080f]">
              <button
                type="button"
                className="relative block aspect-[4/5] max-h-[min(52vh,22rem)] w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--slop-gold-bright)]"
                aria-label={`Flip ${itemName} scorecard to details`}
                aria-controls={flipRegionId}
                aria-expanded={isFlipped}
                onClick={toggleFlip}
              >
              <div className="relative h-full min-h-[14rem] w-full">
                {u ? (
                  <Image
                    src={u}
                    alt={photoAlt}
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 640px) 92vw, 20rem"
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
                      Fan photo
                    </p>
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#04080f] via-transparent to-[#04080f]/35"
                  aria-hidden
                />

                <div className="absolute left-2.5 top-2.5 flex max-w-[72%] flex-col gap-1">
                  {review.verifiedGameDay ? (
                    <span className="inline-flex w-fit items-center gap-1 rounded-md border border-emerald-400/55 bg-[rgba(4,12,8,0.88)] px-2 py-1 text-[0.52rem] font-black uppercase tracking-[0.1em] text-emerald-100">
                      <span
                        className="slop-live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
                        aria-hidden
                      />
                      Verified
                    </span>
                  ) : null}
                  {duplicateHeroBadge ? (
                    <span className="inline-flex w-fit rounded-md border border-white/25 bg-black/75 px-2 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-muted)]">
                      Hero match
                    </span>
                  ) : null}
                  {chips.length > 0 ? (
                    <div className="pointer-events-none max-w-full">
                      <SlopCardHighlightChips labels={chips.slice(0, 2)} />
                    </div>
                  ) : null}
                </div>

                <div className="absolute right-2.5 top-2.5">
                  <div className="rounded-xl border-2 border-[var(--slop-ink)] bg-[linear-gradient(180deg,var(--slop-gold-bright)_0%,var(--slop-gold)_100%)] px-2.5 py-2 text-center shadow-[0_6px_20px_rgba(0,0,0,0.5)]">
                    <p className="text-[0.45rem] font-black uppercase tracking-[0.14em] text-[var(--slop-navy)]">
                      Slop
                    </p>
                    <p className="text-2xl font-black tabular-nums leading-none text-[var(--slop-ink)]">
                      {slopScoreDisplay(review.slopScore)}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
                  <div className="pointer-events-none min-w-0 max-w-[68%] rounded-lg border border-[var(--slop-ink)]/80 bg-[rgba(4,10,18,0.9)] px-2 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.45)]">
                    <ReviewerAvatarBlock review={review} size="md" />
                  </div>
                  <div className="shrink-0 rounded-lg border border-[var(--slop-line-strong)] bg-[rgba(4,10,18,0.9)] px-2 py-1 text-center shadow-[0_4px_12px_rgba(0,0,0,0.45)]">
                    <p className="text-[0.45rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                      Helpful
                    </p>
                    <p className="text-sm font-black tabular-nums text-[var(--slop-cream)]">
                      {review.helpfulLikes}
                    </p>
                  </div>
                </div>
              </div>
              </button>
            </div>

            <div className="relative border-t border-[var(--slop-line-strong)] bg-[linear-gradient(180deg,rgba(8,18,28,0.98),rgba(4,10,18,1))] px-3 py-2.5">
              <p className="line-clamp-1 text-xs font-black text-[var(--slop-cream)]">
                {itemName}
              </p>
              <p className="truncate text-[0.62rem] font-semibold text-[var(--slop-cream-dim)]">
                {venueName}
              </p>
              <button
                type="button"
                className="mt-2 w-full rounded-full border border-[var(--slop-gold)]/45 bg-[color:rgba(244,179,33,0.12)] px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--slop-gold-bright)] transition hover:border-[var(--slop-gold)] hover:bg-[color:rgba(244,179,33,0.2)]"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFlip();
                }}
              >
                Details
              </button>
              <div className="mt-2 space-y-2">{helpfulSlot}</div>
            </div>
          </div>
        </div>

        {/* ——— Back ——— */}
        <div
          id={flipRegionId}
          className="slop-scorecard-face slop-scorecard-face-back absolute inset-0 flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[color:rgba(244,179,33,0.38)] bg-[linear-gradient(180deg,#0a1522_0%,#060f18_100%)] shadow-[0_20px_48px_rgba(0,0,0,0.55)]"
          data-face="back"
          aria-hidden={!isFlipped}
        >
          <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-3">
            <div className="flex items-start justify-between gap-2 border-b border-[var(--slop-line)] pb-2.5">
              <BrandBadgeIcon size={24} />
              <button
                type="button"
                className="shrink-0 rounded-full border border-[var(--slop-line-strong)] px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)] hover:text-[var(--slop-gold-bright)]"
                onClick={showFront}
              >
                Back to front
              </button>
            </div>

            <div className="mt-3">
              <ReviewerAvatarBlock review={review} size="lg" />
              <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                Public scout card · no full profile yet
              </p>
            </div>

            {reviewerStats.length > 0 ? (
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {reviewerStats.map((row) => (
                  <li
                    key={`${row.label}-${row.value}`}
                    className="rounded-lg border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.55)] px-2 py-1.5"
                  >
                    <p className="text-[0.48rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                      {row.label}
                    </p>
                    <p className="text-[0.68rem] font-bold text-[var(--slop-cream)]">
                      {row.value}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-lg border border-dashed border-[var(--slop-line)] px-2.5 py-2 text-[0.62rem] leading-snug text-[var(--slop-cream-dim)]">
                Scout stats roll up soon — for now, read their take below.
              </p>
            )}

            <div className="mt-3">
              <p className="text-[0.48rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
                The take
              </p>
              {review.note?.trim() ? (
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
                  &ldquo;{review.note.trim()}&rdquo;
                </p>
              ) : (
                <p className="mt-1.5 text-xs italic text-[var(--slop-cream-dim)]">
                  No note — score and signals only.
                </p>
              )}
            </div>

            <div className="mt-3">
              <p className="text-[0.48rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
                Score breakdown
              </p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <ScoreDetailRow
                  label="Slop Score"
                  value={`${slopScoreDisplay(review.slopScore)} / 10`}
                />
                <ScoreDetailRow
                  label="Napkins"
                  value={napkinEligible ? `${review.napkinRating}/5` : "N/A (drink)"}
                />
                {review.replayValue ? (
                  <ScoreDetailRow label="Replay" value={review.replayValue} />
                ) : null}
                {review.priceCheck ? (
                  <ScoreDetailRow label="Price" value={review.priceCheck} />
                ) : null}
              </div>
              {chips.length > 0 ? (
                <SlopCardHighlightChips labels={chips} className="mt-2" />
              ) : null}
            </div>

            <div className="mt-3 rounded-lg border border-[var(--slop-line-strong)] bg-[color:rgba(11,27,43,0.65)] px-2.5 py-2">
              <p className="text-[0.48rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                At the park
              </p>
              <p className="mt-0.5 text-sm font-black text-[var(--slop-cream)]">{itemName}</p>
              <p className="text-xs font-bold text-[var(--slop-cream-muted)]">{venueName}</p>
              <p className="mt-1 text-[0.62rem] leading-snug text-[var(--slop-cream-dim)]">
                {metaLine}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg border border-[var(--slop-line)] px-2.5 py-2">
              <span className="text-[0.55rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                Helpful votes
              </span>
              <span className="text-lg font-black tabular-nums text-[var(--slop-orange)]">
                {review.helpfulLikes}
              </span>
            </div>

            <div className="mt-3 space-y-2 border-t border-[var(--slop-line)] pt-3">
              {helpfulSlot}
              {reportSlot}
            </div>

            <button
              type="button"
              className="mt-3 w-full rounded-full border border-[var(--slop-gold)] bg-[linear-gradient(180deg,var(--slop-gold-bright)_0%,var(--slop-gold)_100%)] px-3 py-2.5 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--slop-ink)] shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
              onClick={showFront}
            >
              Back to front
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
