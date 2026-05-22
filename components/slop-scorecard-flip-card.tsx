"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

import { BrandBadgeIcon } from "@/components/brand-badge-icon";
import { SlopCardHighlightChips } from "@/components/slop-card-highlight-chips";
import { SlopScorecardFrame } from "@/components/slop-scorecard-shell";
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
    <div className="rounded-md border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.65)] px-2 py-1.5">
      <p className="text-[0.48rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
        {label}
      </p>
      <p className="mt-0.5 text-[0.68rem] font-bold leading-snug text-[var(--slop-cream)]">
        {value}
      </p>
    </div>
  );
}

function SlopScoreBadge({ score }: { score: number }) {
  return (
    <div className="shrink-0 rounded-lg border border-[var(--slop-ink)] bg-[linear-gradient(165deg,var(--slop-gold-bright)_0%,var(--slop-gold)_100%)] px-2 py-1 text-center shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
      <p className="text-[0.4rem] font-black uppercase tracking-[0.12em] text-[var(--slop-navy)]">
        Slop
      </p>
      <p className="text-lg font-black tabular-nums leading-none text-[var(--slop-ink)]">
        {slopScoreDisplay(score)}
      </p>
    </div>
  );
}

function CompactReviewerStrip({ review }: { review: FoodReview }) {
  const initials = getReviewerInitials(review);
  const handle = getReviewerHandleLabel(review);
  const name = getReviewerDisplayName(review);
  const fanScout = showFanScoutBadge(review);

  return (
    <div className="flex min-w-0 max-w-[58%] items-center gap-1.5">
      <div className="relative shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--slop-gold)]/70 bg-[var(--slop-navy-deep)] text-[0.65rem] font-black text-[var(--slop-cream)] shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
          {initials}
        </div>
        {fanScout ? (
          <span className="absolute -bottom-0.5 left-1/2 w-max -translate-x-1/2 rounded border border-[var(--slop-gold)]/35 bg-[var(--slop-ink)] px-0.5 text-[0.38rem] font-black uppercase tracking-[0.06em] text-[var(--slop-gold-bright)]">
            Scout
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[0.62rem] font-black leading-tight text-[var(--slop-cream)]">
          {handle ?? name}
        </p>
        {handle ? (
          <p className="truncate text-[0.5rem] font-semibold text-[var(--slop-cream-dim)]">
            {name}
          </p>
        ) : null}
      </div>
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
  const dim = size === "lg" ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs";

  return (
    <div className="flex items-center gap-2">
      <div className="relative shrink-0">
        <div
          className={`flex ${dim} items-center justify-center rounded-full border-2 border-[var(--slop-gold)]/75 bg-[var(--slop-navy-deep)] font-black text-[var(--slop-cream)]`}
        >
          {initials}
        </div>
        {fanScout ? (
          <span className="absolute -bottom-1 left-1/2 w-max max-w-[5.5rem] -translate-x-1/2 rounded border border-[var(--slop-gold)]/40 bg-[var(--slop-ink)] px-1 py-px text-[0.4rem] font-black uppercase tracking-[0.08em] text-[var(--slop-gold-bright)]">
            Fan Scout
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-[var(--slop-cream)]">{name}</p>
        {handle ? (
          <p className="truncate text-[0.65rem] font-bold text-[var(--slop-cream-dim)]">
            {handle}
          </p>
        ) : (
          <p className="text-[0.6rem] font-semibold text-[var(--slop-cream-dim)]">
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

  const backBadgeLabels = useMemo(() => {
    const labels = [...highlightLabels];
    if (signalLine && !labels.includes(signalLine)) {
      labels.push(signalLine);
    }
    if (duplicateHeroBadge && !labels.includes("Hero match")) {
      labels.unshift("Hero match");
    }
    return labels;
  }, [highlightLabels, signalLine, duplicateHeroBadge]);

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
      className="slop-scorecard-shell slop-card-shell w-[min(100%,20rem)] max-w-full min-w-0 shrink-0 snap-center sm:w-[18rem]"
      data-slop-scorecard
      data-card-index={cardIndex}
      aria-roledescription="Slop Scorecard"
    >
      <div className={`slop-scorecard-flip-inner ${isFlipped ? "is-flipped" : ""}`}>
        {/* ——— Front ——— */}
        <div className="slop-scorecard-face slop-scorecard-face-front relative w-full">
          <SlopScorecardFrame face="front" className="h-full min-h-[20rem]">
            <div className="relative flex min-h-[20rem] flex-col">
              <button
                type="button"
                className="relative block min-h-[15.5rem] w-full flex-1 cursor-pointer overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--slop-gold-bright)]"
                aria-label={`Flip ${itemName} scorecard to details`}
                aria-controls={flipRegionId}
                aria-expanded={isFlipped}
                onClick={toggleFlip}
              >
                <div className="absolute inset-0 bg-[#04080f]">
                  {u ? (
                    <Image
                      src={u}
                      alt={photoAlt}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 88vw, 18rem"
                      priority={false}
                    />
                  ) : (
                    <div className="flex h-full min-h-[15.5rem] flex-col items-center justify-center gap-2">
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--slop-line-strong)] bg-[var(--slop-surface)] text-2xl"
                        aria-hidden
                      >
                        {photoPlaceholderEmoji ?? "📸"}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#04080f]/55 via-transparent to-[#04080f]/95"
                  aria-hidden
                />

                <div className="pointer-events-none absolute left-2 right-2 top-2 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1 rounded-md border border-[var(--slop-line-strong)]/80 bg-[rgba(4,10,18,0.82)] px-1.5 py-0.5 shadow-sm">
                    <BrandBadgeIcon size={16} title="Stadium Slop" />
                    <span className="truncate text-[0.42rem] font-black uppercase tracking-[0.14em] text-[var(--slop-cream-dim)]">
                      Stadium Slop
                    </span>
                  </div>
                  <SlopScoreBadge score={review.slopScore} />
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 px-2 pb-2 pt-16">
                  <div className="flex items-end justify-between gap-2">
                    <CompactReviewerStrip review={review} />
                    <div
                      className="pointer-events-auto flex shrink-0 flex-col items-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <span className="rounded border border-[var(--slop-line-strong)] bg-[rgba(4,10,18,0.88)] px-1.5 py-0.5 text-[0.48rem] font-black tabular-nums text-[var(--slop-cream)]">
                        {review.helpfulLikes} helpful
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="inline-flex shrink-0 rounded-md border border-[var(--slop-gold)]/50 bg-[rgba(11,27,43,0.92)] px-2 py-1 text-[0.48rem] font-black uppercase tracking-[0.1em] text-[var(--slop-gold-bright)] transition hover:border-[var(--slop-gold)] hover:bg-[rgba(244,179,33,0.15)]"
                          onClick={toggleFlip}
                        >
                          Details
                        </button>
                        <div className="slop-scorecard-action-compact">
                          {helpfulSlot}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              <div className="relative shrink-0 border-t border-[var(--slop-line)]/80 bg-[rgba(4,10,18,0.96)] px-2.5 py-2">
                <p className="line-clamp-2 text-[0.72rem] font-black leading-tight text-[var(--slop-cream)]">
                  {itemName}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[0.55rem] font-bold text-[var(--slop-cream-muted)]">
                  {venueName}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[0.5rem] font-semibold leading-snug text-[var(--slop-cream-dim)]">
                  {metaLine}
                </p>
              </div>
            </div>
          </SlopScorecardFrame>
        </div>

        {/* ——— Back ——— */}
        <div
          id={flipRegionId}
          className="slop-scorecard-face slop-scorecard-face-back absolute inset-0 flex min-h-0 flex-col"
          aria-hidden={!isFlipped}
        >
          <SlopScorecardFrame face="back" className="h-full min-h-[20rem]">
            <div className="flex max-h-[min(70vh,28rem)] min-h-[20rem] flex-col overflow-y-auto overscroll-contain px-2.5 py-2.5">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--slop-line)] pb-2">
                <div className="flex items-center gap-1.5">
                  <BrandBadgeIcon size={18} />
                  <p className="text-[0.45rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
                    Scorecard back
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex shrink-0 rounded-md border border-[var(--slop-line-strong)] bg-[rgba(11,27,43,0.85)] px-2 py-1 text-[0.5rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)] hover:text-[var(--slop-gold-bright)]"
                  onClick={showFront}
                >
                  Back to front
                </button>
              </div>

              {backBadgeLabels.length > 0 ? (
                <div className="mt-2">
                  <p className="text-[0.45rem] font-black uppercase tracking-[0.12em] text-[var(--slop-gold-dim)]">
                    Fan signals
                  </p>
                  <SlopCardHighlightChips labels={backBadgeLabels} className="mt-1" />
                </div>
              ) : null}

              {review.verifiedGameDay ? (
                <p className="mt-2 inline-flex w-fit items-center gap-1 rounded-md border border-emerald-400/45 bg-emerald-950/40 px-1.5 py-0.5 text-[0.48rem] font-black uppercase tracking-[0.1em] text-emerald-100">
                  <span
                    className="slop-live-dot inline-block h-1 w-1 rounded-full bg-emerald-400"
                    aria-hidden
                  />
                  Verified at venue
                </p>
              ) : null}

              <div className="mt-2.5">
                <ReviewerAvatarBlock review={review} size="md" />
                <p className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                  Public scout card
                </p>
              </div>

              {reviewerStats.length > 0 ? (
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {reviewerStats.map((row) => (
                    <li
                      key={`${row.label}-${row.value}`}
                      className="rounded-md border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.55)] px-2 py-1"
                    >
                      <p className="text-[0.45rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                        {row.label}
                      </p>
                      <p className="text-[0.62rem] font-bold text-[var(--slop-cream)]">
                        {row.value}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-2.5">
                <p className="text-[0.45rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
                  The take
                </p>
                {review.note?.trim() ? (
                  <p className="mt-1 text-[0.72rem] leading-relaxed text-[var(--slop-cream-muted)]">
                    &ldquo;{review.note.trim()}&rdquo;
                  </p>
                ) : (
                  <p className="mt-1 text-[0.62rem] italic text-[var(--slop-cream-dim)]">
                    No note — score and signals only.
                  </p>
                )}
              </div>

              <div className="mt-2.5">
                <p className="text-[0.45rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
                  Score breakdown
                </p>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  <ScoreDetailRow
                    label="Slop Score"
                    value={`${slopScoreDisplay(review.slopScore)} / 10`}
                  />
                  <ScoreDetailRow
                    label="Napkins"
                    value={napkinEligible ? `${review.napkinRating}/5` : "N/A"}
                  />
                  {review.replayValue ? (
                    <ScoreDetailRow label="Replay" value={review.replayValue} />
                  ) : null}
                  {review.priceCheck ? (
                    <ScoreDetailRow label="Price" value={review.priceCheck} />
                  ) : null}
                </div>
              </div>

              <div className="mt-2 rounded-md border border-[var(--slop-line-strong)] bg-[color:rgba(11,27,43,0.55)] px-2 py-1.5">
                <p className="text-[0.45rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                  At the park
                </p>
                <p className="mt-0.5 text-[0.72rem] font-black text-[var(--slop-cream)]">
                  {itemName}
                </p>
                <p className="text-[0.6rem] font-bold text-[var(--slop-cream-muted)]">
                  {venueName} · {metaLine}
                </p>
              </div>

              <div className="mt-2.5 space-y-1.5 border-t border-[var(--slop-line)] pt-2">
                {helpfulSlot}
                {reportSlot}
              </div>

              <button
                type="button"
                className="mt-2 inline-flex w-full justify-center rounded-md border border-[var(--slop-gold)]/55 bg-[color:rgba(244,179,33,0.12)] px-2 py-1.5 text-[0.5rem] font-black uppercase tracking-[0.1em] text-[var(--slop-gold-bright)] transition hover:bg-[color:rgba(244,179,33,0.2)]"
                onClick={showFront}
              >
                Back to front
              </button>
            </div>
          </SlopScorecardFrame>
        </div>
      </div>
    </article>
  );
}
