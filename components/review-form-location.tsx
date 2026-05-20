"use client";

import { useCallback, useRef, useState } from "react";

type ReviewFormLocationProps = {
  formId: string;
  submitLabel: string;
  pollingOpen: boolean;
  locationRequiredHint?: string;
};

export function ReviewFormLocation({
  formId,
  submitLabel,
  pollingOpen,
  locationRequiredHint
}: ReviewFormLocationProps) {
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    setClientError(null);

    if (!pollingOpen) {
      return;
    }

    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    if (!navigator.geolocation) {
      setClientError(
        "This browser cannot certify your location. Try a phone at the stadium."
      );
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (latRef.current) {
          latRef.current.value = String(position.coords.latitude);
        }
        if (lngRef.current) {
          lngRef.current.value = String(position.coords.longitude);
        }
        setSubmitting(false);
        form.requestSubmit();
      },
      () => {
        setSubmitting(false);
        setClientError(
          "Allow location access to certify you are at the stadium, then try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    );
  }, [formId, pollingOpen]);

  return (
    <>
      <input ref={latRef} type="hidden" name="latitude" defaultValue="" />
      <input ref={lngRef} type="hidden" name="longitude" defaultValue="" />
      {locationRequiredHint ? (
        <p className="text-center text-[0.65rem] leading-relaxed text-zinc-500">
          {locationRequiredHint}
        </p>
      ) : null}
      {clientError ? (
        <p
          role="alert"
          className="mt-2 rounded-lg border border-amber-800/80 bg-amber-950/40 px-3 py-2 text-center text-xs text-amber-100"
        >
          {clientError}
        </p>
      ) : null}
      <button
        type="button"
        disabled={!pollingOpen || submitting}
        onClick={handleSubmit}
        className="brand-cta mt-3 w-full touch-manipulation rounded-full px-5 py-3.5 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50 sm:py-4"
      >
        {submitting ? "Certifying location…" : submitLabel}
      </button>
    </>
  );
}
