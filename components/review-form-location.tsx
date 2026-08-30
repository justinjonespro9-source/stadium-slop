"use client";

import { useCallback, useState } from "react";

type ReviewFormLocationProps = {
  formId: string;
  pollingOpen: boolean;
  reviewRadiusMeters: number;
  isDraft?: boolean;
  /** Admin QA: submit without geolocation or active game window. */
  testReviewModeActive?: boolean;
  /** Authenticated DB admin: may explicitly skip GPS during an open event window. */
  canUseAdminLocationOverride?: boolean;
  tone?: "brand" | "media";
  /** Fair venues: use fairgrounds copy instead of stadium/home-game copy. */
  isFairgrounds?: boolean;
};

type LocationPhase = "idle" | "certifying" | "captured" | "submitting";

type CapturedCoords = {
  latitude: string;
  longitude: string;
};

export function ReviewFormLocation({
  formId,
  pollingOpen,
  reviewRadiusMeters,
  isDraft = false,
  testReviewModeActive = false,
  canUseAdminLocationOverride = false,
  tone = "brand",
  isFairgrounds = false
}: ReviewFormLocationProps) {
  const [phase, setPhase] = useState<LocationPhase>("idle");
  const [clientError, setClientError] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [capturedCoords, setCapturedCoords] = useState<CapturedCoords | null>(null);
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const isMedia = tone === "media";

  const usingOverride = canUseAdminLocationOverride && overrideEnabled;
  const usingTestReview = testReviewModeActive && !usingOverride;
  const canSubmit = usingTestReview || pollingOpen;
  const certifyBusy = phase === "certifying";
  const submitBusy = phase === "submitting";
  const locationReady =
    usingOverride || usingTestReview || Boolean(capturedCoords && !certifyBusy);

  const certifyLocation = useCallback(() => {
    setClientError(null);

    if (!pollingOpen) {
      return;
    }

    if (!navigator.geolocation) {
      setClientError(
        isFairgrounds
          ? "This browser cannot use location. Try your phone at the fairgrounds with location enabled."
          : "This browser cannot use location. Try your phone at the stadium with location enabled."
      );
      return;
    }

    setPhase("certifying");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCapturedCoords({
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude)
        });
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
        setCapturedCoords(null);
        const denied = err.code === err.PERMISSION_DENIED;
        setClientError(
          denied
            ? "Location permission is off. Allow location for this site in your browser settings, then certify again."
            : isFairgrounds
              ? "Could not read your location. Move to an open area at the fairgrounds and try again."
              : "Could not read your location. Move to an open area at the stadium and try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    );
  }, [pollingOpen, isFairgrounds]);

  const submitReview = useCallback(() => {
    setClientError(null);

    if (!canSubmit) {
      return;
    }

    if (!usingOverride && !usingTestReview) {
      const lat = capturedCoords?.latitude?.trim();
      const lng = capturedCoords?.longitude?.trim();

      if (!lat || !lng) {
        setClientError(
          isFairgrounds
            ? "Certify your location at the fairgrounds before submitting."
            : "Certify your location at the stadium before submitting."
        );
        return;
      }
    }

    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    setPhase("submitting");
    form.requestSubmit();
  }, [
    canSubmit,
    capturedCoords,
    formId,
    usingOverride,
    usingTestReview,
    isFairgrounds
  ]);

  const testAlertClass = isMedia
    ? "media-review-alert media-review-alert--warn"
    : "rounded-xl border border-amber-700/70 bg-amber-950/40 px-3 py-2.5 text-xs leading-relaxed text-amber-100";
  const overrideAlertClass = isMedia
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
  const checkboxLabelClass = isMedia
    ? "flex cursor-pointer items-start gap-2 rounded-xl border border-[rgba(255,107,26,0.28)] bg-[rgba(255,107,26,0.06)] px-3 py-2.5 text-xs leading-relaxed text-[var(--media-ink)]"
    : "flex cursor-pointer items-start gap-2 rounded-xl border border-[color:rgba(255,159,28,0.35)] bg-[color:rgba(255,159,28,0.06)] px-3 py-2.5 text-xs leading-relaxed text-zinc-200";

  const overrideCheckbox = canUseAdminLocationOverride ? (
    <label className={checkboxLabelClass}>
      <input
        type="checkbox"
        name="adminLocationOverride"
        value="1"
        checked={overrideEnabled}
        onChange={(event) => setOverrideEnabled(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--media-orange,#ff9f1c)]"
      />
      <span>
        <span className="font-bold">Admin location override</span>
        <span className={isMedia ? "mt-1 block text-[var(--media-ink-muted)]" : "mt-1 block text-zinc-400"}>
          Skip GPS for this review only. The event window must still be open. This creates a public
          certified review that counts toward Slop Score, Fresh Signal, and awards.
        </span>
      </span>
    </label>
  ) : null;

  if (usingOverride) {
    return (
      <div className="space-y-3">
        {overrideCheckbox}
        {!pollingOpen ? (
          <div role="status" className={closedAlertClass}>
            <p className={`font-bold ${isMedia ? "text-[var(--media-ink)]" : "text-zinc-300"}`}>
              {isFairgrounds ? "Fair reviews not open yet" : "No active home-game window"}
            </p>
            <p className={isMedia ? "mt-1 text-[var(--media-ink-muted)]" : "mt-1"}>
              Admin location override still requires an active event window. You can draft your
              scorecard anytime.
            </p>
          </div>
        ) : (
          <div role="status" className={overrideAlertClass}>
            <p className="font-bold">Public certified review (admin location override)</p>
            <p className="mt-1">
              GPS is skipped for this submission. The review is stored as a normal public scorecard
              with game-day certification. Photos are not marked on-site.
            </p>
          </div>
        )}
        <button
          type="button"
          disabled={!pollingOpen || submitBusy}
          onClick={submitReview}
          className={submitBtnClass}
        >
          {submitBusy ? "Submitting review…" : "Submit certified review (location override)"}
        </button>
      </div>
    );
  }

  if (usingTestReview) {
    return (
      <div className="space-y-3">
        {overrideCheckbox}
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
      {overrideCheckbox}
      <input
        type="hidden"
        name="latitude"
        value={capturedCoords?.latitude ?? ""}
        readOnly
      />
      <input
        type="hidden"
        name="longitude"
        value={capturedCoords?.longitude ?? ""}
        readOnly
      />

      {!pollingOpen ? (
        <div role="status" className={closedAlertClass}>
          <p className={`font-bold ${isMedia ? "text-[var(--media-ink)]" : "text-zinc-300"}`}>
            {isFairgrounds ? "Fair reviews not open yet" : "No active home-game window"}
          </p>
          <p className={isMedia ? "mt-1 text-[var(--media-ink-muted)]" : "mt-1"}>
            {isFairgrounds
              ? "Certified reviews open during Fair hours while you are on the fairgrounds. You can draft your scorecard anytime."
              : "Reviews open during active home-game windows only. You can draft your scorecard anytime; certified submit unlocks when polling is open at this stadium."}
          </p>
        </div>
      ) : null}

      <section aria-labelledby="location-cert-heading" className={locationSectionClass}>
        <h2 id="location-cert-heading" className={headingClass}>
          Location certification
        </h2>
        <p className={bodyClass}>
          {isFairgrounds
            ? `You can draft anytime. Certified reviews can only be submitted during Fair hours while you're on the fairgrounds (within ${reviewRadiusMeters}m of the grounds).`
            : `You can draft anytime. Certified reviews can only be submitted during an active home-game window while you're at the stadium (within ${reviewRadiusMeters}m of the venue).`}
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
            {isFairgrounds
              ? "Step 1: certify at the fairgrounds. Step 2: submit your certified review."
              : "Step 1: certify at the stadium. Step 2: submit your certified review."}
          </p>
        ) : null}
      </section>
    </div>
  );
}
