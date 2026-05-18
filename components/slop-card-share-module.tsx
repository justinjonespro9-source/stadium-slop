"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type SlopCardShareModuleProps = {
  itemHref: string;
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  photoErrorMessage?: string | null;
  photoRetryHref?: string | null;
};

export function SlopCardShareModule({
  itemHref,
  shareUrl,
  shareTitle,
  shareDescription,
  photoErrorMessage,
  photoRetryHref
}: SlopCardShareModuleProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("error");
    }
  }, [shareUrl]);

  const shareSlopCard = useCallback(async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }
    await copyShareLink();
  }, [shareTitle, shareDescription, shareUrl, copyShareLink]);

  const hasPhotoIssue = Boolean(photoErrorMessage);

  return (
    <div
      role="status"
      className={`mt-3 rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4 ${
        hasPhotoIssue
          ? "border-amber-800/70 bg-[color:rgba(69,26,3,0.45)]"
          : "border-[var(--slop-gold)]/40 bg-[color:rgba(244,179,33,0.08)]"
      }`}
    >
      <p
        className={`text-sm font-black sm:text-base ${
          hasPhotoIssue ? "text-amber-50" : "text-[var(--slop-cream)]"
        }`}
      >
        Your Slop Card is ready.
      </p>
      <p
        className={`mt-1 text-xs leading-snug sm:text-sm ${
          hasPhotoIssue ? "text-amber-100/90" : "text-[var(--slop-cream-muted)]"
        }`}
      >
        Share your review and help other fans find what&apos;s worth the walk.
      </p>

      {photoErrorMessage ? (
        <p className="mt-2 text-xs leading-snug text-amber-100/95">{photoErrorMessage}</p>
      ) : (
        <p className="mt-2 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
          Standings and Fresh update from your signals and photos.
        </p>
      )}

      {photoRetryHref ? (
        <p className="mt-2 text-xs text-amber-50/95">
          <Link
            href={photoRetryHref}
            className="font-bold text-white underline decoration-[var(--slop-orange)] underline-offset-2 hover:text-[var(--slop-orange)]"
          >
            Retry photo
          </Link>{" "}
          — updates today&apos;s saved review.
        </p>
      ) : null}

      <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={itemHref}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.65)] px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.06em] text-[var(--slop-cream)] transition hover:border-[var(--slop-gold)]"
        >
          View item
        </Link>
        <button
          type="button"
          onClick={() => void copyShareLink()}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--slop-gold)]/50 bg-[color:rgba(244,179,33,0.12)] px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.06em] text-[var(--slop-gold-bright)] transition hover:bg-[color:rgba(244,179,33,0.2)]"
        >
          {copyState === "copied"
            ? "Link copied"
            : copyState === "error"
              ? "Copy failed — try Share"
              : "Copy share link"}
        </button>
        <button
          type="button"
          onClick={() => void shareSlopCard()}
          className="brand-cta inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.06em]"
        >
          Share Slop Card
        </button>
      </div>

      {/* Future: share event tracking, loyalty points, referral stats — no social account linking required */}
    </div>
  );
}
