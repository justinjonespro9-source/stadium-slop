"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject
} from "react";

import { StadiumSlopWordmark } from "@/components/brand/stadium-slop-wordmark";
import { SlopScorecardFrame } from "@/components/slop-scorecard-shell";
import { HOME_SCORECARD_EXAMPLE } from "@/lib/home-scorecard-example";
import { slopScoreDisplay } from "@/lib/slop-card-display";

function ExampleSlopScoreBadge({ score }: { score: number }) {
  return (
    <div className="slop-scorecard-score-octagon slop-scorecard-score-octagon--compact shrink-0 text-center">
      <p className="text-[0.38rem] font-black uppercase tracking-[0.14em] text-[var(--slop-ink)]">
        Slop
      </p>
      <p className="text-[1.05rem] font-black tabular-nums leading-none text-[var(--slop-ink)]">
        {slopScoreDisplay(score)}
      </p>
    </div>
  );
}

function ExampleBackSectionLabel({ children }: { children: string }) {
  return <p className="slop-scorecard-back-pill">{children}</p>;
}

function ExampleBackMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="slop-scorecard-back-meta-row">
      <span className="slop-scorecard-back-meta-label">{label}</span>
      <span className="slop-scorecard-back-meta-value">{value}</span>
    </div>
  );
}

function ExampleBackStatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="slop-scorecard-back-stat-row">
      <span className="slop-scorecard-back-stat-label">{label}</span>
      <span className="slop-scorecard-back-stat-value">{value}</span>
    </div>
  );
}

function ExampleBackProfilePhoto({
  src,
  alt,
  initials
}: {
  src?: string;
  alt: string;
  initials: string;
}) {
  if (src) {
    return (
      <div className="slop-scorecard-back-profile-photo">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="96px"
        />
      </div>
    );
  }

  return (
    <div className="slop-scorecard-back-profile-initials" aria-hidden>
      {initials}
    </div>
  );
}

function ExampleReviewerProfileBlock() {
  const sample = HOME_SCORECARD_EXAMPLE;
  const reviewerAlt =
    sample.reviewerImageAlt ?? `Illustrative reviewer photo for ${sample.reviewerName}`;

  return (
    <div className="slop-scorecard-back-profile flex items-start gap-2.5">
      <ExampleBackProfilePhoto
        src={sample.reviewerImage}
        alt={reviewerAlt}
        initials={sample.reviewerInitials}
      />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-[0.74rem] font-black leading-tight text-[var(--slop-cream)]">
          {sample.reviewerName}
        </p>
        <p className="truncate text-[0.54rem] font-bold leading-snug text-[var(--slop-cream-dim)]">
          {sample.reviewerHandle}
        </p>
        {sample.showFanScout ? (
          <span className="mt-1 inline-flex rounded border border-[var(--slop-card-orange)]/45 bg-[rgba(255,107,26,0.1)] px-1 py-px text-[0.36rem] font-black uppercase tracking-[0.08em] text-[var(--slop-card-orange-bright)]">
            Fan Scout
          </span>
        ) : null}
        {sample.showMoreAtVenue ? (
          <p className="mt-1 text-[0.48rem] font-bold text-[var(--slop-card-orange-dim)]">
            More at this venue →
          </p>
        ) : null}
        <p className="slop-scorecard-back-career-label mt-1.5">Career Stats</p>
        <div className="slop-scorecard-back-career-stats">
          <ExampleBackMetaRow label="Venues Reviewed" value={sample.venuesReviewed} />
          <ExampleBackMetaRow label="Items Reviewed" value={sample.itemsReviewed} />
          <ExampleBackMetaRow label="Helpful Earned" value={sample.helpfulEarned} />
        </div>
      </div>
    </div>
  );
}

function ExampleFoodPhoto({
  src,
  alt,
  emoji
}: {
  src?: string;
  alt: string;
  emoji: string;
}) {
  return (
    <div className="slop-scorecard-photo-well-inner home-scorecard-example__photo relative min-h-[10.5rem] flex-1 overflow-hidden bg-gradient-to-br from-[#2a1810] via-[#1a120e] to-[#0f0c0a]">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 767px) 90vw, 304px"
        />
      ) : (
        <div
          className="flex h-full min-h-[10.5rem] w-full items-center justify-center"
          aria-hidden
        >
          <span className="text-5xl opacity-90">{emoji}</span>
        </div>
      )}
    </div>
  );
}

function ExampleReviewerAvatar({
  src,
  alt,
  initials
}: {
  src?: string;
  alt: string;
  initials: string;
}) {
  return (
    <div className="home-scorecard-example__avatar relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[var(--slop-card-orange)] bg-[var(--slop-navy-deep)]">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="44px"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center text-[0.7rem] font-black text-[var(--slop-cream)]"
          aria-hidden
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function ExampleScorecardFrontFace() {
  const sample = HOME_SCORECARD_EXAMPLE;
  const foodAlt =
    sample.foodImageAlt ?? `Illustrative food photo for ${sample.itemName}`;
  const reviewerAlt =
    sample.reviewerImageAlt ?? `Illustrative reviewer photo for ${sample.reviewerName}`;

  return (
    <div className="home-scorecard-example__face home-scorecard-example__face--front slop-scorecard-face slop-scorecard-face-front absolute inset-0">
      <SlopScorecardFrame face="front" className="h-full w-full">
        <div className="flex h-full min-h-0 flex-col">
          <div className="slop-scorecard-header slop-scorecard-header--front relative z-[2] grid shrink-0 grid-cols-[1fr_auto] items-center gap-2 px-2 pt-2">
            <StadiumSlopWordmark size="scorecard" className="min-w-0" />
            <ExampleSlopScoreBadge score={sample.slopScore} />
          </div>
          <div className="slop-scorecard-front-body flex min-h-0 flex-1 flex-col">
            <div className="slop-scorecard-photo-well flex min-h-0 flex-1 flex-col px-2">
              <ExampleFoodPhoto
                src={sample.foodImage}
                alt={foodAlt}
                emoji={sample.photoEmoji}
              />
            </div>
            <div className="slop-scorecard-info-block shrink-0 px-2 pb-2">
              <p className="line-clamp-2 text-[1rem] font-black leading-tight tracking-tight text-[var(--slop-cream)]">
                {sample.itemName}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[0.58rem] font-bold text-[var(--slop-cream-muted)]">
                {sample.venueContext}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[0.5rem] font-semibold leading-snug text-[var(--slop-cream-dim)]">
                <span className="mr-0.5 opacity-80" aria-hidden>
                  📍
                </span>
                {sample.locationHint}
              </p>
            </div>
            <div className="slop-scorecard-footer flex shrink-0 items-center gap-2 px-2 pb-2">
              <ExampleReviewerAvatar
                src={sample.reviewerImage}
                alt={reviewerAlt}
                initials={sample.reviewerInitials}
              />
              <p className="min-w-0 truncate text-[0.65rem] font-black text-[var(--slop-cream)]">
                {sample.reviewerName}
              </p>
            </div>
          </div>
        </div>
      </SlopScorecardFrame>
    </div>
  );
}

function ExampleScorecardBackFace({
  scrollRef
}: {
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const sample = HOME_SCORECARD_EXAMPLE;

  return (
    <div className="home-scorecard-example__face home-scorecard-example__face--back slop-scorecard-face slop-scorecard-face-back absolute inset-0">
      <SlopScorecardFrame face="back" className="h-full w-full">
        <div
          ref={scrollRef}
          className="home-scorecard-example__back-scroll flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-2.5 py-2"
        >
          <div className="slop-scorecard-header flex shrink-0 items-center justify-between gap-2 px-0 py-1.5">
            <StadiumSlopWordmark size="scorecard" />
          </div>

          <div className="mt-1 shrink-0">
            <ExampleReviewerProfileBlock />
          </div>

          <div className="mt-2 shrink-0">
            <ExampleBackSectionLabel>Slop Signals</ExampleBackSectionLabel>
            <div className="slop-scorecard-back-stat-panel mt-1">
              <ExampleBackStatRow
                label="Slop Score"
                value={`${slopScoreDisplay(sample.backSlopScore)} / 10`}
              />
              <ExampleBackStatRow label="Napkin Rating" value={sample.napkinRating} />
              <ExampleBackStatRow label="Replay Value" value={sample.replayValue} />
              <ExampleBackStatRow label="Price Check" value={sample.priceCheck} />
            </div>
          </div>

          <div className="mt-2 shrink-0">
            <ExampleBackSectionLabel>Hot Take</ExampleBackSectionLabel>
            <p className="mt-1 text-[0.62rem] leading-relaxed text-[var(--slop-cream-muted)]">
              &ldquo;{sample.hotTake}&rdquo;
            </p>
          </div>

          <div className="mt-2 shrink-0 rounded border border-[var(--slop-line)] bg-[rgba(6,14,24,0.45)] px-2 py-1.5">
            <ExampleBackSectionLabel>This card</ExampleBackSectionLabel>
            <p className="mt-1 text-[0.68rem] font-black leading-tight text-[var(--slop-cream)]">
              {sample.cardItemName}
            </p>
            <p className="text-[0.52rem] font-bold text-[var(--slop-cream-muted)]">
              {sample.cardVenueName}
            </p>
            <p className="mt-0.5 text-[0.5rem] leading-snug text-[var(--slop-cream-dim)]">
              {sample.cardMetaLine}
            </p>
            <ExampleBackMetaRow label="Date posted" value={sample.datePosted} />
          </div>
        </div>
      </SlopScorecardFrame>
    </div>
  );
}

function resetScrollContainer(el: HTMLDivElement | null) {
  if (!el) {
    return;
  }
  el.scrollTop = 0;
  el.scrollLeft = 0;
}

export function HomeScorecardFlipExample() {
  const [showBack, setShowBack] = useState(false);
  const statusId = useId();
  const backScrollRef = useRef<HTMLDivElement>(null);

  const toggleFlip = useCallback(() => {
    setShowBack((prev) => !prev);
  }, []);

  useEffect(() => {
    resetScrollContainer(backScrollRef.current);
    if (!showBack) {
      return;
    }
    // Re-apply after layout/flip so the back face always opens at the top.
    const frame = requestAnimationFrame(() => {
      resetScrollContainer(backScrollRef.current);
      requestAnimationFrame(() => resetScrollContainer(backScrollRef.current));
    });
    return () => cancelAnimationFrame(frame);
  }, [showBack]);

  const showFront = !showBack;
  const flipLabel = showFront
    ? "Show back of example scorecard"
    : "Show front of example scorecard";

  return (
    <div className="home-scorecard-example__flip-wrap min-w-0">
      <p id={`${statusId}-status`} className="sr-only" aria-live="polite">
        {showFront ? "Example scorecard showing front." : "Example scorecard showing back."}
      </p>

      <div className="home-scorecard-example__flip-shell w-full">
        <button
          type="button"
          className="home-scorecard-example__flip-trigger"
          onClick={toggleFlip}
          aria-label={flipLabel}
          aria-describedby={`${statusId}-hint`}
        >
          <div
            className={`home-scorecard-example__flip-inner${showBack ? " is-flipped" : ""}`}
          >
            <ExampleScorecardFrontFace />
            <ExampleScorecardBackFace scrollRef={backScrollRef} />
          </div>
        </button>
      </div>

      <div className="home-scorecard-example__flip-controls">
        <p className="home-scorecard-example__flip-hint" id={`${statusId}-hint`}>
          Tap or click the card to flip.
        </p>
        <button
          type="button"
          className="home-scorecard-example__flip-btn"
          onClick={toggleFlip}
          aria-pressed={showBack}
          aria-label={flipLabel}
          aria-describedby={`${statusId}-hint ${statusId}-status`}
        >
          Flip card
        </button>
      </div>

      <p
        className="home-scorecard-example__face-indicator text-center text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--media-ink-dim)]"
        aria-hidden
      >
        {showFront ? "Front" : "Back"}
      </p>
    </div>
  );
}
