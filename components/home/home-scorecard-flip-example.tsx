"use client";

import Image from "next/image";
import { useCallback, useId, useState } from "react";

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

function ExampleBackStatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="slop-scorecard-back-stat-row">
      <span className="slop-scorecard-back-stat-label">{label}</span>
      <span className="slop-scorecard-back-stat-value">{value}</span>
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

function ExampleScorecardBackFace() {
  const sample = HOME_SCORECARD_EXAMPLE;

  return (
    <div className="home-scorecard-example__face home-scorecard-example__face--back slop-scorecard-face slop-scorecard-face-back absolute inset-0">
      <SlopScorecardFrame face="back" className="h-full w-full">
        <div className="flex h-full min-h-0 flex-col overflow-hidden px-2.5 py-2.5">
          <div className="slop-scorecard-header flex shrink-0 items-center justify-between gap-2 py-1">
            <p className="text-[0.55rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
              Slop Signals
            </p>
            <StadiumSlopWordmark size="scorecard" className="max-w-[5.5rem]" />
          </div>
          <div className="slop-scorecard-back-stat-panel mt-2 min-h-0 flex-1 space-y-0">
            <ExampleBackStatRow label="Napkin Rating" value={sample.napkinRating} />
            <ExampleBackStatRow label="Replay Value" value={sample.replayValue} />
            <ExampleBackStatRow label="Price Check" value={sample.priceCheck} />
            <ExampleBackStatRow label="Mess signal" value={sample.messSignal} />
          </div>
          <div className="mt-2 shrink-0 rounded-lg border border-[var(--slop-line-strong)] bg-[rgba(6,15,24,0.55)] px-2 py-2">
            <p className="text-[0.48rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
              Hot Take
            </p>
            <p className="mt-1 text-[0.62rem] font-semibold leading-snug text-[var(--slop-cream-muted)]">
              &ldquo;{sample.hotTake}&rdquo;
            </p>
          </div>
        </div>
      </SlopScorecardFrame>
    </div>
  );
}

export function HomeScorecardFlipExample() {
  const [showBack, setShowBack] = useState(false);
  const statusId = useId();

  const toggleFlip = useCallback(() => {
    setShowBack((prev) => !prev);
  }, []);

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
            <ExampleScorecardBackFace />
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
