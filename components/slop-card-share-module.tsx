"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { SlopCardHighlightChips } from "@/components/slop-card-highlight-chips";
import { slopScoreDisplay } from "@/lib/slop-card-display";

export type SlopCardSharePreview = {
  itemName: string;
  venueName: string;
  metaLine?: string;
  slopScore?: number;
  highlightLabels?: string[];
};

type SlopCardShareModuleProps = {
  itemHref: string;
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  photoErrorMessage?: string | null;
  photoRetryHref?: string | null;
  preview?: SlopCardSharePreview | null;
};

export function SlopCardShareModule({
  itemHref,
  shareUrl,
  shareTitle,
  shareDescription,
  photoErrorMessage,
  photoRetryHref,
  preview
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
      className={`slop-card-share-celebrate mt-3 overflow-hidden rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 ${
        hasPhotoIssue
          ? "border-amber-800/70 bg-[color:rgba(69,26,3,0.5)]"
          : "border-[color:rgba(244,179,33,0.45)] bg-[linear-gradient(165deg,rgba(244,179,33,0.16)_0%,rgba(11,27,43,0.92)_42%,rgba(6,15,24,0.98)_100%)] shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full border border-[color:rgba(244,179,33,0.4)] bg-[color:rgba(244,179,33,0.12)] px-2.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-bright)]">
          Slop Card live
        </span>
        <span className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
          Fan-powered guide
        </span>
      </div>

      <p
        className={`mt-2 text-lg font-black leading-tight sm:text-xl ${
          hasPhotoIssue ? "text-amber-50" : "text-[var(--slop-cream)]"
        }`}
      >
        Your Slop Card is ready.
      </p>
      <p
        className={`mt-1.5 text-sm leading-snug ${
          hasPhotoIssue ? "text-amber-100/90" : "text-[var(--slop-cream-muted)]"
        }`}
      >
        Help fans find what&apos;s worth the walk — screenshot your card or share
        the link.
      </p>

      {preview ? (
        <div
          className="mt-4 max-w-[20rem] rounded-2xl border border-[color:rgba(244,179,33,0.35)] bg-[var(--slop-navy-deep)] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          aria-hidden
        >
          <p className="text-[0.5rem] font-black uppercase tracking-[0.18em] text-[var(--slop-gold-bright)]">
            Stadium Slop · Preview
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-black text-[var(--slop-cream)]">
            {preview.itemName}
          </p>
          <p className="truncate text-xs font-bold text-[var(--slop-cream-muted)]">
            {preview.venueName}
          </p>
          {preview.metaLine ? (
            <p className="mt-0.5 line-clamp-1 text-[0.62rem] text-[var(--slop-cream-dim)]">
              {preview.metaLine}
            </p>
          ) : null}
          {preview.slopScore != null ? (
            <p className="mt-2 text-2xl font-black tabular-nums text-[var(--slop-orange)]">
              {slopScoreDisplay(preview.slopScore)}
              <span className="ml-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                Slop
              </span>
            </p>
          ) : null}
          {preview.highlightLabels && preview.highlightLabels.length > 0 ? (
            <SlopCardHighlightChips
              labels={preview.highlightLabels}
              className="mt-2"
            />
          ) : null}
        </div>
      ) : null}

      {photoErrorMessage ? (
        <p className="mt-3 text-xs leading-snug text-amber-100/95">{photoErrorMessage}</p>
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

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void shareSlopCard()}
          className="brand-cta inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-black uppercase tracking-[0.06em]"
        >
          Share Slop Card
        </button>
        <button
          type="button"
          onClick={() => void copyShareLink()}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[var(--slop-gold)]/55 bg-[color:rgba(244,179,33,0.1)] px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.06em] text-[var(--slop-gold-bright)] transition hover:bg-[color:rgba(244,179,33,0.18)]"
        >
          {copyState === "copied"
            ? "Link copied"
            : copyState === "error"
              ? "Copy failed — try Share"
              : "Copy link"}
        </button>
        <Link
          href={itemHref}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.06em] text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)]/40 hover:text-[var(--slop-cream)]"
        >
          View item
        </Link>
      </div>

      <p className="mt-3 text-center text-[0.6rem] leading-snug text-[var(--slop-cream-dim)]">
        Tip: screenshot your card in Photo reviews — looks great in stories.
      </p>
    </div>
  );
}
