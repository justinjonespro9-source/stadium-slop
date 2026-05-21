"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { PhotoCropUpload } from "@/components/photo-crop-upload";
import { SlopScoreSlider } from "@/components/slop-score-slider";
import {
  LOW_SCORE_PHOTO_MESSAGE,
  LOW_SCORE_PHOTO_THRESHOLD,
  requiresLowScorePhoto
} from "@/lib/review-scorecard";

type ReviewScorecardFormClientProps = {
  formId: string;
  defaultSlopScore: number;
  cloudinaryReady: boolean;
  defaultCaption: string;
  existingPhotoUrl: string | null;
  existingPhotoAlt: string;
  children: ReactNode;
};

export function ReviewScorecardFormClient({
  formId,
  defaultSlopScore,
  cloudinaryReady,
  defaultCaption,
  existingPhotoUrl,
  existingPhotoAlt,
  children
}: ReviewScorecardFormClientProps) {
  const [slopScore, setSlopScore] = useState(defaultSlopScore);
  const [lowScorePhotoError, setLowScorePhotoError] = useState<string | null>(null);
  const photoRequired = requiresLowScorePhoto(slopScore);
  const hasExistingPhoto = Boolean(existingPhotoUrl?.trim());
  const hasPhotoRef = useRef(hasExistingPhoto);

  const syncHasPhoto = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>(
      `form#${CSS.escape(formId)} input[name="reviewPhoto"]`
    );
    const file = input?.files?.[0];
    hasPhotoRef.current = hasExistingPhoto || Boolean(file && file.size > 0);
  }, [formId, hasExistingPhoto]);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form || !(form instanceof HTMLFormElement)) {
      return;
    }

    const onSubmit = (event: SubmitEvent) => {
      syncHasPhoto();
      if (requiresLowScorePhoto(slopScore) && !hasPhotoRef.current) {
        event.preventDefault();
        setLowScorePhotoError(LOW_SCORE_PHOTO_MESSAGE);
        document
          .getElementById("review-photo-section")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      setLowScorePhotoError(null);
    };

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [formId, slopScore, syncHasPhoto]);

  return (
    <>
      <section aria-labelledby="slop-label">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="slop-label" className="text-sm font-black text-white">
            Slop Score <span className="text-[var(--slop-orange)]">*</span>
          </h2>
          <span className="text-[0.65rem] font-bold text-zinc-500">
            {LOW_SCORE_PHOTO_THRESHOLD.toFixed(1)}+ optional photo
          </span>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          Fan score for what you got — drag the slider (0.1 steps).
        </p>
        <SlopScoreSlider defaultValue={defaultSlopScore} onValueChange={setSlopScore} />
      </section>

      {children}

      <section
        id="review-photo-section"
        className={`rounded-xl border bg-black/80 p-3 sm:p-4 ${
          photoRequired
            ? "border-amber-700/70 ring-1 ring-amber-900/40"
            : "border-zinc-800"
        }`}
      >
        <h2 className="text-sm font-black text-white">
          Fan photo{" "}
          {photoRequired ? (
            <span className="text-[var(--slop-orange)]">*</span>
          ) : (
            <span className="font-semibold text-zinc-500">(optional)</span>
          )}
        </h2>
        {photoRequired ? (
          <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-200/95">
            {LOW_SCORE_PHOTO_MESSAGE}
          </p>
        ) : (
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Snap or upload for Fresh signals and your Slop Scorecard front.
          </p>
        )}
        {lowScorePhotoError ? (
          <p className="mt-2 text-xs font-bold text-amber-300" role="alert">
            {lowScorePhotoError}
          </p>
        ) : null}
        {cloudinaryReady ? (
          <div onChange={syncHasPhoto}>
            <PhotoCropUpload
              formId={formId}
              inputName="reviewPhoto"
              captionName="photoCaption"
              defaultCaption={defaultCaption}
              existingPhotoUrl={existingPhotoUrl}
              existingPhotoAlt={existingPhotoAlt}
            />
          </div>
        ) : photoRequired ? (
          <p className="mt-3 rounded-lg border border-amber-800/80 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
            Photo uploads are unavailable — you cannot submit a score under{" "}
            {LOW_SCORE_PHOTO_THRESHOLD.toFixed(1)} until Cloudinary is configured.
          </p>
        ) : (
          <p className="mt-3 rounded-lg border border-dashed border-zinc-700 px-3 py-2 text-xs text-zinc-500">
            Cloudinary not configured — save without a photo.
          </p>
        )}
      </section>
    </>
  );
}
