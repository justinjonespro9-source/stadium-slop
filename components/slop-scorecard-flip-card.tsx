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

/** Stops back-face tap-to-flip from swallowing button/link/form clicks. */
function ScorecardNoFlip({ children }: { children: ReactNode }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

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
    <div className="slop-scorecard-score-octagon shrink-0 px-2.5 py-1.5 text-center">
      <p className="text-[0.42rem] font-black uppercase tracking-[0.16em] text-[var(--slop-navy)]">
        Slop
      </p>
      <p className="text-[1.35rem] font-black tabular-nums leading-none text-[var(--slop-ink)]">
        {slopScoreDisplay(score)}
      </p>
    </div>
  );
}

function ScorecardFrontHeader({
  venueName,
  slopScore
}: {
  venueName: string;
  slopScore: number;
}) {
  return (
    <div className="slop-scorecard-header relative z-[2] flex shrink-0 items-start justify-between gap-2 px-2.5 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <BrandBadgeIcon size={30} title="Stadium Slop" />
        <div className="min-w-0 leading-tight">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream)]">
            Slop Scorecard
          </p>
          <p className="mt-0.5 truncate text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
            {venueName}
          </p>
        </div>
      </div>
      <SlopScoreBadge score={slopScore} />
    </div>
  );
}

function CompactReviewerStrip({ review }: { review: FoodReview }) {
  const initials = getReviewerInitials(review);
  const handle = getReviewerHandleLabel(review);
  const name = getReviewerDisplayName(review);
  const fanScout = showFanScoutBadge(review);

  return (
    <div className="flex min-w-0 max-w-[52%] items-center gap-2">
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--slop-gold)] bg-[var(--slop-navy-deep)] text-[0.7rem] font-black text-[var(--slop-cream)] shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
          {initials}
        </div>
        {fanScout ? (
          <span className="absolute -bottom-0.5 left-1/2 w-max -translate-x-1/2 rounded border border-[var(--slop-gold)]/45 bg-[var(--slop-ink)] px-1 py-px text-[0.36rem] font-black uppercase text-[var(--slop-gold-bright)]">
            Scout
          </span>
        ) : null}
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[0.65rem] font-black text-[var(--slop-cream)]">
          {name}
        </p>
        {handle ? (
          <p className="truncate text-[0.52rem] font-bold text-[var(--slop-cream-dim)]">
            {handle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ReviewerAvatarBlock({ review }: { review: FoodReview }) {
  const initials = getReviewerInitials(review);
  const handle = getReviewerHandleLabel(review);
  const name = getReviewerDisplayName(review);
  const fanScout = showFanScoutBadge(review);

  return (
    <div className="flex items-center gap-2">
      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--slop-gold)]/75 bg-[var(--slop-navy-deep)] text-xs font-black text-[var(--slop-cream)]">
          {initials}
        </div>
        {fanScout ? (
          <span className="absolute -bottom-1 left-1/2 w-max -translate-x-1/2 rounded border border-[var(--slop-gold)]/40 bg-[var(--slop-ink)] px-1 py-px text-[0.4rem] font-black uppercase text-[var(--slop-gold-bright)]">
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
        ) : null}
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
      className="slop-scorecard-shell slop-card-shell"
      data-slop-scorecard
      data-card-index={cardIndex}
      data-active={cardIndex === 0 ? "true" : "false"}
      aria-roledescription="Slop Scorecard"
    >
      <div className={`slop-scorecard-flip-inner ${isFlipped ? "is-flipped" : ""}`}>
        {/* ——— Front ——— */}
        <div className="slop-scorecard-face slop-scorecard-face-front absolute inset-0">
          <SlopScorecardFrame face="front" className="h-full w-full">
            <div className="flex h-full min-h-0 flex-col">
              <ScorecardFrontHeader venueName={venueName} slopScore={review.slopScore} />

              <div className="flex min-h-0 flex-1 flex-col px-1.5 pt-1 pb-1.5">
                <div className="slop-scorecard-photo-well slop-scorecard-chamfer-sm flex min-h-0 flex-1 flex-col">
                  <button
                    type="button"
                    className="slop-scorecard-photo-well-inner slop-scorecard-chamfer-sm relative block h-full min-h-[10.5rem] w-full flex-1 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--slop-gold-bright)]"
                    aria-label={`Flip ${itemName} scorecard to details`}
                    aria-controls={flipRegionId}
                    aria-expanded={isFlipped}
                    onClick={toggleFlip}
                  >
                    {u ? (
                      <Image
                        src={u}
                        alt={photoAlt}
                        fill
                        className="object-cover object-center"
                        sizes="300px"
                        priority={false}
                      />
                    ) : (
                      <div className="flex h-full min-h-[10.5rem] items-center justify-center">
                        <span
                          className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--slop-line-strong)] bg-[var(--slop-surface)] text-3xl"
                          aria-hidden
                        >
                          {photoPlaceholderEmoji ?? "📸"}
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                <div className="slop-scorecard-info-block shrink-0">
                  <p className="line-clamp-2 text-[1rem] font-black leading-tight tracking-tight text-[var(--slop-cream)]">
                    {itemName}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[0.58rem] font-bold text-[var(--slop-cream-muted)]">
                    {venueName}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[0.5rem] font-semibold leading-snug text-[var(--slop-cream-dim)]">
                    <span className="mr-0.5 opacity-80" aria-hidden>
                      📍
                    </span>
                    {metaLine}
                  </p>
                </div>

                <div className="slop-scorecard-footer relative z-[2] flex shrink-0 items-end justify-between gap-2 px-2 py-2">
                  <CompactReviewerStrip review={review} />
                  <div className="slop-scorecard-footer-actions">
                    <span className="slop-scorecard-helpful-count">
                      <span aria-hidden className="text-[0.55rem]">
                        👍
                      </span>
                      <span className="tabular-nums">{review.helpfulLikes}</span>
                    </span>
                    <div className="slop-scorecard-footer-btn-row">
                      <button
                        type="button"
                        className="slop-scorecard-btn-pill"
                        onClick={toggleFlip}
                      >
                        Details
                      </button>
                      <div className="slop-scorecard-action-compact">{helpfulSlot}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SlopScorecardFrame>
        </div>

        {/* ——— Back ——— */}
        <div
          id={flipRegionId}
          className="slop-scorecard-face slop-scorecard-face-back absolute inset-0 cursor-pointer"
          aria-hidden={!isFlipped}
          onClick={showFront}
        >
          <SlopScorecardFrame face="back" className="h-full w-full">
            <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-2.5 py-2">
              <div className="slop-scorecard-header flex shrink-0 items-center justify-between gap-2 px-0 py-1.5">
                <BrandBadgeIcon size={26} title="Stadium Slop" />
                <ScorecardNoFlip>
                  <button
                    type="button"
                    className="slop-scorecard-btn-pill"
                    onClick={showFront}
                  >
                    Back to front
                  </button>
                </ScorecardNoFlip>
              </div>

              {backBadgeLabels.length > 0 ? (
                <div className="mt-1.5 shrink-0">
                  <p className="text-[0.42rem] font-black uppercase tracking-[0.12em] text-[var(--slop-red)]">
                    Fan signals
                  </p>
                  <SlopCardHighlightChips labels={backBadgeLabels} className="mt-0.5" />
                </div>
              ) : null}

              {review.verifiedGameDay ? (
                <p className="mt-1.5 inline-flex w-fit shrink-0 items-center gap-1 rounded border border-emerald-400/45 bg-emerald-950/40 px-1.5 py-0.5 text-[0.45rem] font-black uppercase text-emerald-100">
                  <span className="slop-live-dot inline-block h-1 w-1 rounded-full bg-emerald-400" />
                  Verified
                </p>
              ) : null}

              <div className="mt-2 shrink-0">
                <ReviewerAvatarBlock review={review} />
              </div>

              {reviewerStats.length > 0 ? (
                <ul className="mt-1.5 grid shrink-0 grid-cols-2 gap-1">
                  {reviewerStats.map((row) => (
                    <li
                      key={`${row.label}-${row.value}`}
                      className="rounded border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.55)] px-1.5 py-1"
                    >
                      <p className="text-[0.42rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                        {row.label}
                      </p>
                      <p className="text-[0.58rem] font-bold text-[var(--slop-cream)]">
                        {row.value}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-2 shrink-0">
                <p className="text-[0.42rem] font-black uppercase tracking-[0.12em] text-[var(--slop-red)]">
                  The take
                </p>
                {review.note?.trim() ? (
                  <p className="mt-0.5 text-[0.65rem] leading-relaxed text-[var(--slop-cream-muted)]">
                    &ldquo;{review.note.trim()}&rdquo;
                  </p>
                ) : (
                  <p className="mt-0.5 text-[0.58rem] italic text-[var(--slop-cream-dim)]">
                    No note on this card.
                  </p>
                )}
              </div>

              <div className="mt-2 shrink-0">
                <p className="text-[0.42rem] font-black uppercase tracking-[0.12em] text-[var(--slop-red)]">
                  Score breakdown
                </p>
                <div className="mt-0.5 grid grid-cols-2 gap-1">
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

              <div className="mt-2 shrink-0 rounded border border-[var(--slop-line-strong)] bg-[color:rgba(11,27,43,0.55)] px-2 py-1">
                <p className="text-[0.42rem] font-black uppercase tracking-[0.1em] text-[var(--slop-red)]">
                  At the park
                </p>
                <p className="mt-0.5 text-[0.68rem] font-black text-[var(--slop-cream)]">
                  {itemName}
                </p>
                <p className="text-[0.55rem] text-[var(--slop-cream-muted)]">{metaLine}</p>
              </div>

              <div className="mt-2 flex shrink-0 items-center justify-between rounded border border-[var(--slop-line)] px-2 py-1">
                <span className="text-[0.48rem] font-black uppercase text-[var(--slop-cream-dim)]">
                  Helpful votes
                </span>
                <span className="text-base font-black tabular-nums text-[var(--slop-red)]">
                  {review.helpfulLikes}
                </span>
              </div>

              <ScorecardNoFlip>
                <div className="mt-2 shrink-0 space-y-1 border-t border-[var(--slop-line)] pt-2">
                  {helpfulSlot}
                  {reportSlot}
                </div>
              </ScorecardNoFlip>
            </div>
          </SlopScorecardFrame>
        </div>
      </div>
    </article>
  );
}
