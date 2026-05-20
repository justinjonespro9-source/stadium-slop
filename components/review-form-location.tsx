"use client";

import { useCallback, useRef, useState } from "react";

type ReviewFormLocationProps = {
  formId: string;
  pollingOpen: boolean;
  reviewRadiusMeters: number;
  isDraft?: boolean;
};

type LocationPhase = "idle" | "certifying" | "captured" | "submitting";

export function ReviewFormLocation({
  formId,
  pollingOpen,
  reviewRadiusMeters,
  isDraft = false
}: ReviewFormLocationProps) {
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<LocationPhase>("idle");
  const [clientError, setClientError] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [coordsCaptured, setCoordsCaptured] = useState(false);

  const certifyBusy = phase === "certifying";
  const submitBusy = phase === "submitting";
  const locationReady = coordsCaptured && !certifyBusy;

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

    if (!pollingOpen) {
      return;
    }

    const lat = latRef.current?.value?.trim();
    const lng = lngRef.current?.value?.trim();
    if (!lat || !lng) {
      setClientError("Certify your location at the stadium before submitting.");
      return;
    }

    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    setPhase("submitting");
    form.requestSubmit();
  }, [formId, pollingOpen]);

  return (
    <div className="mt-4 space-y-3">
      <input ref={latRef} type="hidden" name="latitude" defaultValue="" />
      <input ref={lngRef} type="hidden" name="longitude" defaultValue="" />

      {!pollingOpen ? (
        <div
          role="status"
          className="rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2.5 text-xs leading-relaxed text-zinc-400"
        >
          <p className="font-bold text-zinc-300">No active home-game window</p>
          <p className="mt-1">
            Reviews open during active home-game windows only. You can draft your
            scorecard anytime; certified submit unlocks when polling is open at
            this stadium.
          </p>
        </div>
      ) : null}

      <section
        aria-labelledby="location-cert-heading"
        className="rounded-xl border border-[color:rgba(255,159,28,0.35)] bg-[color:rgba(255,159,28,0.06)] px-3 py-3 sm:px-4 sm:py-4"
      >
        <h2
          id="location-cert-heading"
          className="text-sm font-black text-white"
        >
          Location certification
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
          You can draft anytime. Certified reviews can only be submitted during
          an active home-game window while you&apos;re at the stadium (within{" "}
          {reviewRadiusMeters}m of the venue).
        </p>

        {phase === "captured" && capturedAt ? (
          <p
            role="status"
            className="mt-3 rounded-lg border border-emerald-800/70 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100"
          >
            <span className="font-bold">Location captured</span> at {capturedAt}.
            Submit when your scorecard is ready — certify again if you moved or
            need a fresh reading.
          </p>
        ) : null}

        {clientError ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-amber-800/80 bg-amber-950/40 px-3 py-2 text-xs text-amber-100"
          >
            {clientError}
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={!pollingOpen || certifyBusy || submitBusy}
            onClick={certifyLocation}
            className="brand-cta-secondary w-full touch-manipulation rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[11rem]"
          >
            {certifyBusy ? "Reading location…" : "Certify my location"}
          </button>
          <button
            type="button"
            disabled={!pollingOpen || !locationReady || submitBusy}
            onClick={submitReview}
            className="brand-cta w-full touch-manipulation rounded-full px-5 py-3.5 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:py-4"
          >
            {submitBusy
              ? "Submitting review…"
              : isDraft
                ? "Certify location & update review"
                : "Certify location & submit review"}
          </button>
        </div>

        {pollingOpen && !locationReady && !certifyBusy ? (
          <p className="mt-2 text-[0.65rem] leading-relaxed text-zinc-500">
            Step 1: certify at the stadium. Step 2: submit your certified review.
          </p>
        ) : null}
      </section>
    </div>
  );
}
