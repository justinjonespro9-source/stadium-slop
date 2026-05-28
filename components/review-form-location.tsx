"use client";

import { useCallback, useRef, useState } from "react";

type ReviewFormLocationProps = {
  formId: string;
  pollingOpen: boolean;
  reviewRadiusMeters: number;
  isDraft?: boolean;
  /** Admin QA: submit without geolocation or active game window. */
  testReviewModeActive?: boolean;
  tone?: "brand" | "media";
};

type LocationPhase = "idle" | "certifying" | "captured" | "submitting";

export function ReviewFormLocation({
  formId,
  pollingOpen,
  reviewRadiusMeters,
  isDraft = false,
  testReviewModeActive = false,
  tone = "brand"
}: ReviewFormLocationProps) {
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<LocationPhase>("idle");
  const [clientError, setClientError] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [coordsCaptured, setCoordsCaptured] = useState(false);
  const isMedia = tone === "media";

  const canSubmit = testReviewModeActive || pollingOpen;
  const certifyBusy = phase === "certifying";
  const submitBusy = phase === "submitting";
  const locationReady = testReviewModeActive || (coordsCaptured && !certifyBusy);

  const certifyLocation = useCallback(() => {
    setClientError(null);

    if (!pollingOpen) {
      return;
    }

    if (!navigator.geolocation) {
      setClientError(
        "This browser cannot use location. Try your phone at the stadium with location enabled."
      );
      return;
    }

    setPhase("certifying");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (latRef.current) {
          latRef.current.value = String(position.coords.latitude);
        }
        if (lngRef.current) {
          lngRef.current.value = String(position.coords.longitude);
        }
        setCoordsCaptured(true);
        setCapturedAt(
          new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
          })
        );
        setPhase("captured");
      },
      (err) => {
        setPhase("idle");
        setCoordsCaptured(false);
        const denied = err.code === err.PERMISSION_DENIED;
        setClientError(
          denied
            ? "Location permission is off. Allow location for this site in your browser settings, then certify again."
            : "Could not read your location. Move to an open area at the stadium and try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    );
  }, [pollingOpen]);

  const submitReview = useCallback(() => {
    setClientError(null);

    if (!canSubmit) {
      return;
    }

    if (!testReviewModeActive) {
      const lat = latRef.current?.value?.trim();
      const lng = lngRef.current?.value?.trim();
      if (!lat || !lng) {
        setClientError("Certify your location at the stadium before submitting.");
        return;
      }
    }

    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    setPhase("submitting");
    form.requestSubmit();
  }, [canSubmit, formId, testReviewModeActive]);

  const testAlertClass = isMedia
    ? "media-review-alert media-review-alert--warn"
    : "rounded-xl border border-amber-700/70 bg-amber-950/40 px-3 py-2.5 text-xs leading-relaxed text-amber-100";
  const closedAlertClass = isMedia
    ? "media-review-alert media-review-alert--neutral rounded-xl px-3 py-2.5 text-xs"
    : "rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2.5 text-xs leading-relaxed text-zinc-400";
  const locationSectionClass = isMedia
    ? "rounded-xl border border-[rgba(255,107,26,0.28)] bg-[rgba(255,107,26,0.06)] px-3 py-3 sm:px-4 sm:py-4"
    : "rounded-xl border border-[color:rgba(255,159,28,0.35)] bg-[color:rgba(255,159,28,0.06)] px-3 py-3 sm:px-4 sm:py-4";
  const headingClass = isMedia
    ? "media-review-card-title"
    : "text-sm font-black text-white";
  const bodyClass = isMedia
    ? "mt-1.5 text-xs leading-relaxed text-[var(--media-ink-muted)]"
    : "mt-1.5 text-xs leading-relaxed text-zinc-400";
  const capturedClass = isMedia
    ? "media-review-alert media-review-alert--success mt-3 rounded-lg px-3 py-2 text-xs"
    : "mt-3 rounded-lg border border-emerald-800/70 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100";
  const errorClass = isMedia
    ? "media-review-alert media-review-alert--error mt-3 rounded-lg px-3 py-2 text-xs"
    : "mt-3 rounded-lg border border-amber-800/80 bg-amber-950/40 px-3 py-2 text-xs text-amber-100";
  const certifyBtnClass = isMedia
    ? "media-cta-outline w-full touch-manipulation px-4 py-3 text-xs font-bold sm:w-auto sm:min-w-[11rem]"
    : "brand-cta-secondary w-full touch-manipulation rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[11rem]";
  const submitBtnClass = isMedia
    ? "media-primary-button w-full touch-manipulation px-5 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:py-4"
    : "brand-cta w-full touch-manipulation rounded-full px-5 py-3.5 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:py-4";
  const stepHintClass = isMedia
    ? "mt-2 text-[0.65rem] leading-relaxed text-[var(--media-ink-dim)]"
    : "mt-2 text-[0.65rem] leading-relaxed text-zinc-500";

  if (testReviewModeActive) {
    return (
      <div className="space-y-3">
        <div role="status" className={testAlertClass}>
          <p className="font-bold">Test review mode (admin QA)</p>
          <p className="mt-1">
            No location certification required. This review is stored as a test submission and is
            excluded from public Slop Score, Fresh Signal, price/replay rollups, and fan-favorite
            awards. Scorecards may still show it with a test label for layout QA.
          </p>
        </div>
        <button
          type="button"
          disabled={submitBusy}
          onClick={submitReview}
          className={submitBtnClass}
        >
          {submitBusy ? "Submitting test review…" : "Submit test review"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input ref={latRef} type="hidden" name="latitude" defaultValue="" />
      <input ref={lngRef} type="hidden" name="longitude" defaultValue="" />

      {!pollingOpen ? (
        <div role="status" className={closedAlertClass}>
          <p className={`font-bold ${isMedia ? "text-[var(--media-ink)]" : "text-zinc-300"}`}>
            No active home-game window
          </p>
          <p className={isMedia ? "mt-1 text-[var(--media-ink-muted)]" : "mt-1"}>
            Reviews open during active home-game windows only. You can draft your scorecard anytime;
            certified submit unlocks when polling is open at this stadium.
          </p>
        </div>
      ) : null}

      <section aria-labelledby="location-cert-heading" className={locationSectionClass}>
        <h2 id="location-cert-heading" className={headingClass}>
          Location certification
        </h2>
        <p className={bodyClass}>
          You can draft anytime. Certified reviews can only be submitted during an active
          home-game window while you&apos;re at the stadium (within {reviewRadiusMeters}m of the
          venue).
        </p>

        {phase === "captured" && capturedAt ? (
          <p role="status" className={capturedClass}>
            <span className="font-bold">Location captured</span> at {capturedAt}. Submit when your
            scorecard is ready — certify again if you moved or need a fresh reading.
          </p>
        ) : null}

        {clientError ? (
          <p role="alert" className={errorClass}>
            {clientError}
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={!pollingOpen || certifyBusy || submitBusy}
            onClick={certifyLocation}
            className={certifyBtnClass}
          >
            {certifyBusy ? "Reading location…" : "Certify my location"}
          </button>
          <button
            type="button"
            disabled={!pollingOpen || !locationReady || submitBusy}
            onClick={submitReview}
            className={submitBtnClass}
          >
            {submitBusy
              ? "Submitting review…"
              : isDraft
                ? "Certify location & update review"
                : "Certify location & submit review"}
          </button>
        </div>

        {pollingOpen && !locationReady && !certifyBusy ? (
          <p className={stepHintClass}>
            Step 1: certify at the stadium. Step 2: submit your certified review.
          </p>
        ) : null}
      </section>
    </div>
  );
}
