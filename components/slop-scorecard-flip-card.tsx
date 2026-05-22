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
  getSlopScorecardReviewerProfile,
  showFanScoutBadge,
  type SlopScorecardReviewerProfile
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
  /** Icon-only helpful control on the card front (does not flip the card). */
  frontHelpfulSlot: ReactNode;
  /** Full helpful / report controls on the card back. */
  backHelpfulSlot: ReactNode;
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

function BackSectionLabel({ children }: { children: ReactNode }) {
  return <p className="slop-scorecard-back-pill">{children}</p>;
}

function BackMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="slop-scorecard-back-meta-row">
      <span className="slop-scorecard-back-meta-label">{label}</span>
      <span className="slop-scorecard-back-meta-value">{value}</span>
    </div>
  );
}

function BackStatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="slop-scorecard-back-stat-row">
      <span className="slop-scorecard-back-stat-label">{label}</span>
      <span className="slop-scorecard-back-stat-value">{value}</span>
    </div>
  );
}

function ReviewerProfileBlock({
  profile,
  avatarUrl,
  photoAlt
}: {
  profile: SlopScorecardReviewerProfile;
  avatarUrl: string | undefined;
  photoAlt: string;
}) {
  return (
    <div className="flex gap-2">
      {avatarUrl ? (
        <div className="slop-scorecard-back-profile-photo">
          <Image
            src={avatarUrl}
            alt={photoAlt}
            fill
            className="object-cover object-center"
            sizes="72px"
          />
        </div>
      ) : (
        <div className="slop-scorecard-back-profile-initials" aria-hidden>
          {profile.initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.72rem] font-black leading-tight text-[var(--slop-cream)]">
          {profile.displayName}
        </p>
        {profile.handle ? (
          <p className="truncate text-[0.52rem] font-bold text-[var(--slop-cream-dim)]">
            {profile.handle}
          </p>
        ) : null}
        <div className="mt-1">
          <BackMetaRow label="Venues reviewed" value={profile.venuesReviewed} />
          <BackMetaRow label="Items reviewed" value={profile.itemsReviewed} />
          <BackMetaRow label="Helpful earned" value={profile.helpfulEarned} />
        </div>
        {profile.showFanScout ? (
          <span className="mt-1 inline-flex rounded border border-[var(--slop-gold)]/40 bg-[rgba(244,179,33,0.08)] px-1 py-px text-[0.36rem] font-black uppercase tracking-[0.08em] text-[var(--slop-gold-bright)]">
            Fan Scout
          </span>
        ) : null}
      </div>
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

function ScorecardFrontHeader({ slopScore }: { slopScore: number }) {
  return (
    <div className="slop-scorecard-header slop-scorecard-header--front relative z-[2] grid shrink-0 grid-cols-[auto_1fr_auto] items-center gap-1.5 px-2 py-2">
      <BrandBadgeIcon size={46} title="Stadium Slop" className="shrink-0" />
      <div className="slop-scorecard-title-stack min-w-0 px-0.5">
        <span className="slop-scorecard-title-line">Slop</span>
        <span className="slop-scorecard-title-line slop-scorecard-title-line--wide">
          Scorecard
        </span>
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
  frontHelpfulSlot,
  backHelpfulSlot,
  reportSlot,
  duplicateHeroBadge
}: SlopScorecardFlipCardProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipRegionId = useId();
  const u = normalizePublicImageUrl(photoUrl);
  const reviewerProfile = useMemo(
    () => getSlopScorecardReviewerProfile(review),
    [review]
  );
  const noteText = review.note?.trim() ?? "";

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
              <ScorecardFrontHeader slopScore={review.slopScore} />

              <div className="flex min-h-0 flex-1 flex-col px-1.5 pt-1 pb-1.5">
                <div className="slop-scorecard-photo-well flex min-h-0 flex-1 flex-col">
                  <button
                    type="button"
                    className="slop-scorecard-photo-well-inner relative block h-full min-h-[10.5rem] w-full flex-1 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--slop-gold-bright)]"
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
                  <ScorecardNoFlip>
                    <div className="slop-scorecard-helpful-row">
                      <span className="slop-scorecard-helpful-count tabular-nums">
                        {review.helpfulLikes}
                      </span>
                      <div className="slop-scorecard-helpful-icon-slot">
                        {frontHelpfulSlot}
                      </div>
                    </div>
                  </ScorecardNoFlip>
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

              <div className="mt-1.5 shrink-0">
                <ReviewerProfileBlock
                  profile={reviewerProfile}
                  avatarUrl={u}
                  photoAlt={photoAlt}
                />
              </div>

              {reviewerProfile.verifiedGameDay ? (
                <p className="mt-1.5 inline-flex w-fit shrink-0 items-center gap-1 rounded border border-emerald-400/45 bg-emerald-950/40 px-1.5 py-0.5 text-[0.42rem] font-black uppercase text-emerald-100">
                  <span className="slop-live-dot inline-block h-1 w-1 rounded-full bg-emerald-400" />
                  Game-day certified
                </p>
              ) : null}

              {backBadgeLabels.length > 0 ? (
                <div className="mt-2 shrink-0">
                  <BackSectionLabel>Slop Signals</BackSectionLabel>
                  <SlopCardHighlightChips labels={backBadgeLabels} className="mt-1" />
                </div>
              ) : null}

              <div className="mt-2 shrink-0">
                <BackSectionLabel>Score breakdown</BackSectionLabel>
                <div className="slop-scorecard-back-stat-panel mt-1">
                  <BackStatRow
                    label="Slop Score"
                    value={`${slopScoreDisplay(review.slopScore)} / 10`}
                  />
                  <BackStatRow
                    label="Napkin rating"
                    value={napkinEligible ? `${review.napkinRating} / 5` : "N/A"}
                  />
                  <BackStatRow
                    label="Replay value"
                    value={review.replayValue ?? "—"}
                  />
                  <BackStatRow
                    label="Price check"
                    value={review.priceCheck ?? "—"}
                  />
                </div>
              </div>

              <div className="mt-2 shrink-0">
                <BackSectionLabel>Hot Take</BackSectionLabel>
                {noteText ? (
                  <p className="mt-1 text-[0.62rem] leading-relaxed text-[var(--slop-cream-muted)]">
                    &ldquo;{noteText}&rdquo;
                  </p>
                ) : (
                  <p className="mt-1 text-[0.52rem] italic text-[var(--slop-cream-dim)]">
                    No hot take added.
                  </p>
                )}
              </div>

              <div className="mt-2 shrink-0 rounded border border-[var(--slop-line)] bg-[rgba(6,14,24,0.45)] px-2 py-1.5">
                <BackSectionLabel>This card</BackSectionLabel>
                <p className="mt-1 text-[0.68rem] font-black leading-tight text-[var(--slop-cream)]">
                  {itemName}
                </p>
                <p className="text-[0.52rem] font-bold text-[var(--slop-cream-muted)]">
                  {venueName}
                </p>
                <p className="mt-0.5 text-[0.5rem] leading-snug text-[var(--slop-cream-dim)]">
                  {metaLine}
                </p>
                {reviewerProfile.datePosted ? (
                  <BackMetaRow
                    label="Date posted"
                    value={reviewerProfile.datePosted}
                  />
                ) : null}
              </div>

              <ScorecardNoFlip>
                <div className="mt-2 shrink-0 space-y-1 border-t border-[var(--slop-line)] pt-2">
                  {backHelpfulSlot}
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
