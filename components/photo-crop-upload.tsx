"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";

import {
  CROP_ASPECT,
  blobToUploadFile,
  clampPan,
  computeContainScale,
  computeCoverScale,
  cropImageToBlob,
  assignFileToInput,
  prepareClientUploadFile,
  validateClientImageFile,
  type CropTransform
} from "@/lib/photo-crop-client";

const SLIDER_MAX_ZOOM = 3;

type PhotoCropUploadProps = {
  inputName?: string;
  formId: string;
  captionName?: string;
  defaultCaption?: string;
  existingPhotoUrl?: string | null;
  existingPhotoAlt?: string;
  disabled?: boolean;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image for preview."));
    };
    img.src = url;
  });
}

export function PhotoCropUpload({
  inputName = "reviewPhoto",
  formId,
  captionName,
  defaultCaption = "",
  existingPhotoUrl,
  existingPhotoAlt = "Current fan photo",
  disabled = false
}: PhotoCropUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Rear camera on mobile when supported; no permission until user taps the control. */
  const cameraPickerRef = useRef<HTMLInputElement>(null);
  /** Photo library / files without `capture` so users can pick an existing image. */
  const libraryPickerRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const submitSyncedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [zoomFactor, setZoomFactor] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [useFullPhoto, setUseFullPhoto] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [cropWarning, setCropWarning] = useState<string | null>(null);
  const [frameSize, setFrameSize] = useState({ w: 320, h: 240 });

  const zoomLabelId = useId();

  const { minZoomFactor, effectiveScale } = useMemo(() => {
    if (!imageEl) {
      return { minZoomFactor: 1, effectiveScale: 1 };
    }
    const iw = imageEl.naturalWidth;
    const ih = imageEl.naturalHeight;
    const fw = frameSize.w;
    const fh = frameSize.h;
    const cover = computeCoverScale(iw, ih, fw, fh);
    const contain = computeContainScale(iw, ih, fw, fh);
    return {
      minZoomFactor: contain / cover,
      effectiveScale: cover * zoomFactor
    };
  }, [imageEl, frameSize.w, frameSize.h, zoomFactor]);

  useEffect(() => {
    setZoomFactor((z) =>
      Math.min(SLIDER_MAX_ZOOM, Math.max(minZoomFactor, z))
    );
  }, [minZoomFactor]);

  const transform: CropTransform = {
    scale: effectiveScale,
    offsetX: offset.x,
    offsetY: offset.y
  };

  const resetCropState = useCallback((options?: { clearPicker?: boolean }) => {
    setSourceFile(null);
    setImageEl(null);
    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setZoomFactor(1);
    setOffset({ x: 0, y: 0 });
    setUseFullPhoto(false);
    setCropWarning(null);
    if (fileInputRef.current) {
      assignFileToInput(fileInputRef.current, null);
    }
    if (options?.clearPicker !== false) {
      if (cameraPickerRef.current) {
        cameraPickerRef.current.value = "";
      }
      if (libraryPickerRef.current) {
        libraryPickerRef.current.value = "";
      }
    }
  }, []);

  const clearPickerInputsOnly = useCallback(() => {
    if (cameraPickerRef.current) {
      cameraPickerRef.current.value = "";
    }
    if (libraryPickerRef.current) {
      libraryPickerRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const w = Math.max(1, Math.round(entry.contentRect.width));
      const h = Math.max(1, Math.round(w / CROP_ASPECT));
      setFrameSize({ w, h });
    });
    ro.observe(frame);
    return () => ro.disconnect();
  }, [previewUrl]);

  useEffect(() => {
    if (!imageEl || useFullPhoto) {
      return;
    }
    setOffset((prev) => {
      const clamped = clampPan(
        imageEl.naturalWidth,
        imageEl.naturalHeight,
        frameSize.w,
        frameSize.h,
        effectiveScale,
        prev.x,
        prev.y
      );
      if (clamped.offsetX === prev.x && clamped.offsetY === prev.y) {
        return prev;
      }
      return { x: clamped.offsetX, y: clamped.offsetY };
    });
  }, [imageEl, effectiveScale, frameSize, useFullPhoto]);

  const handleFileChange = async (file: File | null) => {
    setValidationError(null);
    setCropWarning(null);

    if (!file) {
      resetCropState();
      return;
    }

    resetCropState({ clearPicker: false });

    let prepared: File;
    try {
      prepared = await prepareClientUploadFile(file);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Could not use that image."
      );
      clearPickerInputsOnly();
      return;
    }

    try {
      const img = await loadImageFromFile(prepared);
      const url = URL.createObjectURL(prepared);
      setSourceFile(prepared);
      setPreviewUrl(url);
      setImageEl(img);
      setZoomFactor(1);
      setOffset({ x: 0, y: 0 });
      setUseFullPhoto(false);
      clearPickerInputsOnly();
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Could not load that image."
      );
      clearPickerInputsOnly();
    }
  };

  const syncToFormInput = useCallback(async () => {
    const input = fileInputRef.current;
    if (!input) {
      return;
    }

    if (!sourceFile) {
      assignFileToInput(input, null);
      return;
    }

    if (useFullPhoto) {
      try {
        const prepared = await prepareClientUploadFile(sourceFile);
        const postCheck = validateClientImageFile(prepared);
        if (!postCheck.ok) {
          throw new Error(postCheck.message);
        }
        assignFileToInput(input, prepared);
        setCropWarning(null);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Could not attach full photo. Try crop mode or submit without a photo.";
        setCropWarning(msg);
        assignFileToInput(input, null);
      }
      return;
    }

    if (!imageEl) {
      assignFileToInput(input, null);
      setCropWarning("Image is still loading. Wait a moment and submit again.");
      return;
    }

    try {
      const blob = await cropImageToBlob(
        imageEl,
        {
          scale: effectiveScale,
          offsetX: offset.x,
          offsetY: offset.y
        },
        frameSize.w,
        frameSize.h
      );
      const cropped = blobToUploadFile(blob, sourceFile.name);
      const postCheck = validateClientImageFile(cropped);
      if (!postCheck.ok) {
        throw new Error(postCheck.message);
      }
      assignFileToInput(input, cropped);
      setCropWarning(null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Crop failed. Try “Use full photo”.";
      setCropWarning(msg);
      assignFileToInput(input, null);
    }
  }, [sourceFile, useFullPhoto, imageEl, effectiveScale, offset, frameSize]);

  useEffect(() => {
    const el = document.getElementById(formId);
    if (!(el instanceof HTMLFormElement)) {
      return;
    }
    const form = el;

    const onSubmit = (e: Event) => {
      if (submitSyncedRef.current) {
        submitSyncedRef.current = false;
        return;
      }

      if (!sourceFile) {
        return;
      }

      e.preventDefault();
      void (async () => {
        await syncToFormInput();
        const attached = fileInputRef.current?.files?.[0];
        if (sourceFile && (!attached || attached.size === 0)) {
          setCropWarning(
            "Photo could not be attached. Try “Use full photo”, re-pick the image, or submit without a photo."
          );
          return;
        }
        submitSyncedRef.current = true;
        form.requestSubmit();
      })();
    };

    form.addEventListener("submit", onSubmit, true);
    return () => form.removeEventListener("submit", onSubmit, true);
  }, [formId, syncToFormInput, sourceFile, imageEl, useFullPhoto]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!imageEl || useFullPhoto || disabled) {
      return;
    }
    pointerIdRef.current = e.pointerId;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId || !imageEl || useFullPhoto) {
      return;
    }
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const clamped = clampPan(
      imageEl.naturalWidth,
      imageEl.naturalHeight,
      frameSize.w,
      frameSize.h,
      effectiveScale,
      dragStartRef.current.ox + dx,
      dragStartRef.current.oy + dy
    );
    setOffset({ x: clamped.offsetX, y: clamped.offsetY });
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current === e.pointerId) {
      pointerIdRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const drawW = imageEl ? imageEl.naturalWidth * transform.scale : 0;
  const drawH = imageEl ? imageEl.naturalHeight * transform.scale : 0;

  return (
    <div className="mt-3 space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        name={inputName}
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />

      <div className="block">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
          Food photo{" "}
          <span className="font-semibold normal-case text-[var(--slop-cream-dim)]">
            (optional)
          </span>
        </p>
        <p className="mt-1.5 text-[0.7rem] leading-snug text-[var(--slop-cream-muted)]">
          Optional. Take a quick food photo or choose one from your library. We only
          receive the image you submit with this review.
        </p>
        <p className="mt-1 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
          JPEG, PNG, WebP, or GIF · about 8MB max · iPhone HEIC converts to JPEG
          when your browser supports it
        </p>

        <input
          ref={cameraPickerRef}
          type="file"
          accept="image/*"
          capture="environment"
          disabled={disabled}
          aria-label="Take or upload a food photo"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            void handleFileChange(f);
          }}
        />
        <input
          ref={libraryPickerRef}
          type="file"
          accept="image/*"
          disabled={disabled}
          aria-label="Choose a food photo from your library"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            void handleFileChange(f);
          }}
        />

        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => cameraPickerRef.current?.click()}
            className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl border-0 bg-[var(--slop-orange)] px-4 py-3 text-center text-sm font-black text-[var(--slop-ink)] shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Take or upload food photo
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => libraryPickerRef.current?.click()}
            className="inline-flex min-h-10 w-full touch-manipulation items-center justify-center rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.5)] px-4 py-2.5 text-center text-xs font-bold text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)]/40 hover:text-[var(--slop-cream)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Choose from photo library
          </button>
        </div>
      </div>

      {validationError ? (
        <p role="alert" className="text-xs font-semibold text-amber-200/95">
          {validationError}
        </p>
      ) : null}

      {existingPhotoUrl && !previewUrl ? (
        <div className="flex gap-3 rounded-lg border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.65)] p-2">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-black sm:h-24 sm:w-24">
            <Image
              src={existingPhotoUrl}
              alt={existingPhotoAlt}
              fill
              className="object-contain"
              sizes="96px"
            />
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
              Current photo
            </p>
            <p className="mt-1 text-xs text-[var(--slop-cream-muted)]">
              Pick a new file to replace — position before submit.
            </p>
          </div>
        </div>
      ) : null}

      {previewUrl && imageEl ? (
        <div className="space-y-2.5 rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.85)] p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-[var(--slop-cream)]">
              {useFullPhoto ? "Full photo selected" : "Drag to position"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {!useFullPhoto ? (
                <>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setZoomFactor(minZoomFactor);
                      setOffset({ x: 0, y: 0 });
                    }}
                    className="rounded-full border border-[var(--slop-line-strong)] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[var(--slop-cream-muted)] hover:border-[var(--slop-gold)]/50"
                  >
                    Fit in frame
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setZoomFactor(1);
                      setOffset({ x: 0, y: 0 });
                    }}
                    className="rounded-full border border-[var(--slop-line-strong)] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[var(--slop-cream-muted)] hover:border-[var(--slop-gold)]/50"
                  >
                    Fill frame
                  </button>
                </>
              ) : null}
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  setUseFullPhoto(true);
                  setCropWarning(null);
                }}
                className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] ${
                  useFullPhoto
                    ? "border-[var(--slop-gold)] bg-[rgba(244,179,33,0.15)] text-[var(--slop-gold-bright)]"
                    : "border-[var(--slop-line-strong)] text-[var(--slop-cream-muted)] hover:border-[var(--slop-gold)]/50"
                }`}
              >
                Use full photo
              </button>
              {useFullPhoto ? (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setUseFullPhoto(false)}
                  className="rounded-full border border-[var(--slop-line-strong)] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[var(--slop-cream-muted)]"
                >
                  Crop frame
                </button>
              ) : null}
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  void handleFileChange(null);
                }}
                className="rounded-full border border-[var(--slop-line-strong)] px-2.5 py-1 text-[0.65rem] font-bold text-[var(--slop-cream-dim)]"
              >
                Clear
              </button>
            </div>
          </div>

          <div
            ref={frameRef}
            className={`relative mx-auto w-full max-w-md touch-none overflow-hidden rounded-lg border-2 bg-[#080f18] ${
              useFullPhoto
                ? "border-[var(--slop-line-strong)]"
                : "border-[var(--slop-gold)]/60"
            }`}
            style={{ aspectRatio: `${CROP_ASPECT}` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-label="Photo crop frame. Drag to reposition."
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Crop preview"
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: drawW,
                height: drawH,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`
              }}
            />
            {!useFullPhoto ? (
              <div
                className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-[var(--slop-cream)]/20"
                aria-hidden
              />
            ) : null}
          </div>

          {!useFullPhoto ? (
            <div>
              <label
                htmlFor={zoomLabelId}
                className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]"
              >
                Zoom — left fits whole photo (letterboxed), right zooms tighter
              </label>
              <input
                id={zoomLabelId}
                type="range"
                min={minZoomFactor}
                max={SLIDER_MAX_ZOOM}
                step={0.002}
                value={zoomFactor}
                disabled={disabled}
                onChange={(e) => setZoomFactor(Number(e.target.value))}
                className="mt-1 w-full accent-[var(--slop-gold)]"
              />
            </div>
          ) : null}

          {cropWarning ? (
            <p role="alert" className="text-xs leading-snug text-amber-200/95">
              {cropWarning} You can submit without a photo, or tap{" "}
              <span className="font-bold">Use full photo</span>.
            </p>
          ) : null}

          <p className="text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
            Default fills the 4:3 frame (like a tight crop). Zoom out to show the
            full dish with stadium-navy letterboxing, or zoom in to reframe.
          </p>
        </div>
      ) : null}

      {captionName ? (
        <label className="block">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
            Caption (optional)
          </span>
          <input
            name={captionName}
            maxLength={120}
            placeholder="e.g. First-bite cheese pull"
            defaultValue={defaultCaption}
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-[var(--slop-line-strong)] bg-[var(--slop-navy-deep)] px-3 py-2 text-sm text-[var(--slop-cream)] outline-none placeholder:text-[var(--slop-cream-dim)] focus:border-[var(--slop-orange)]"
          />
        </label>
      ) : null}
    </div>
  );
}
