"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { PhotoCropUpload } from "@/components/photo-crop-upload";
import { SlopScoreSlider } from "@/components/slop-score-slider";
import {
  LOW_SCORE_PHOTO_MESSAGE,
  LOW_SCORE_PHOTO_THRESHOLD,
  requiresLowScorePhoto
} from "@/lib/review-scorecard";
import { getReviewPhotoSectionTitle } from "@/lib/venue-copy-context";

type ReviewScorecardFormClientProps = {
  formId: string;
  defaultSlopScore: number;
  cloudinaryReady: boolean;
  existingPhotoUrl: string | null;
  existingPhotoAlt: string;
  children: ReactNode;
  tone?: "brand" | "media";
  venueSlug?: string;
};

export function ReviewScorecardFormClient({
  formId,
  defaultSlopScore,
  cloudinaryReady,
  existingPhotoUrl,
  existingPhotoAlt,
  children,
  tone = "brand",
  venueSlug = ""
}: ReviewScorecardFormClientProps) {
  const photoSectionTitle = venueSlug
    ? getReviewPhotoSectionTitle(venueSlug)
    : "Fan photo";
  const [slopScore, setSlopScore] = useState(defaultSlopScore);
  const [lowScorePhotoError, setLowScorePhotoError] = useState<string | null>(null);
  const photoRequired = requiresLowScorePhoto(slopScore);
  const hasExistingPhoto = Boolean(existingPhotoUrl?.trim());
  const hasPhotoRef = useRef(hasExistingPhoto);
  const isMedia = tone === "media";

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

  const titleClass = isMedia
    ? "media-review-card-title"
    : "text-sm font-black text-white";
  const hintClass = isMedia ? "media-review-card-hint" : "mt-0.5 text-xs text-zinc-500";
  const scoreCardClass = isMedia ? "media-review-card" : "";
  const photoCardClass = isMedia
    ? `media-review-card ${
        photoRequired ? "border-[rgba(255,107,26,0.45)] ring-2 ring-[rgba(255,107,26,0.12)]" : ""
      }`
    : `rounded-xl border bg-black/80 p-3 sm:p-4 ${
        photoRequired
          ? "border-amber-700/70 ring-1 ring-amber-900/40"
          : "border-zinc-800"
      }`;
  const lowScoreTextClass = isMedia
    ? "mt-1 text-xs font-semibold leading-relaxed text-[var(--media-orange-deep)]"
    : "mt-1 text-xs font-semibold leading-relaxed text-amber-200/95";
  const optionalPhotoHintClass = isMedia ? "media-review-card-hint mt-1" : "mt-1 text-xs leading-relaxed text-zinc-500";
  const lowScoreErrorClass = isMedia
    ? "mt-2 text-xs font-bold text-[var(--media-orange-deep)]"
    : "mt-2 text-xs font-bold text-amber-300";

  return (
    <>
      <section className={scoreCardClass} aria-labelledby="slop-label">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="slop-label" className={titleClass}>
            Slop Score <span className="text-[var(--media-orange)]">*</span>
          </h2>
          <span
            className={
              isMedia
                ? "text-[0.65rem] font-bold text-[var(--media-ink-dim)]"
                : "text-[0.65rem] font-bold text-zinc-500"
            }
          >
            {LOW_SCORE_PHOTO_THRESHOLD.toFixed(1)}+ optional photo
          </span>
        </div>
        <p className={hintClass}>Fan score for what you got — drag the slider (0.1 steps).</p>
        <SlopScoreSlider
          tone={tone}
          defaultValue={defaultSlopScore}
          onValueChange={setSlopScore}
        />
      </section>

      {children}

      <section id="review-photo-section" className={photoCardClass}>
        <h2 className={titleClass}>
          {photoSectionTitle}{" "}
          {photoRequired ? (
            <span className="text-[var(--media-orange)]">*</span>
          ) : (
            <span className={isMedia ? "font-semibold text-[var(--media-ink-dim)]" : "font-semibold text-zinc-500"}>
              (optional)
            </span>
          )}
        </h2>
        {photoRequired ? (
          <p className={lowScoreTextClass}>{LOW_SCORE_PHOTO_MESSAGE}</p>
        ) : (
          <p className={optionalPhotoHintClass}>
            Snap or upload for Fresh signals and your Slop Scorecard front.
          </p>
        )}
        {lowScorePhotoError ? (
          <p className={lowScoreErrorClass} role="alert">
            {lowScorePhotoError}
          </p>
        ) : null}
        {cloudinaryReady ? (
          <div className="mt-3" onChange={syncHasPhoto}>
            <PhotoCropUpload
              formId={formId}
              inputName="reviewPhoto"
              existingPhotoUrl={existingPhotoUrl}
              existingPhotoAlt={existingPhotoAlt}
            />
          </div>
        ) : photoRequired ? (
          <p
            className={
              isMedia
                ? "media-review-alert media-review-alert--warn mt-3"
                : "mt-3 rounded-lg border border-amber-800/80 bg-amber-950/40 px-3 py-2 text-xs text-amber-100"
            }
          >
            Photo uploads are unavailable — you cannot submit a score under{" "}
            {LOW_SCORE_PHOTO_THRESHOLD.toFixed(1)} until Cloudinary is configured.
          </p>
        ) : (
          <p
            className={
              isMedia
                ? "mt-3 rounded-lg border border-dashed border-[var(--media-border)] bg-[var(--media-surface)] px-3 py-2 text-xs text-[var(--media-ink-muted)]"
                : "mt-3 rounded-lg border border-dashed border-zinc-700 px-3 py-2 text-xs text-zinc-500"
            }
          >
            Cloudinary not configured — save without a photo.
          </p>
        )}
      </section>
    </>
  );
}
