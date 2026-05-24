"use client";

import { useCallback, useState } from "react";

type ScorecardShareActionsProps = {
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  variant?: "compact" | "default";
};

export function ScorecardShareActions({
  shareUrl,
  shareTitle,
  shareDescription,
  variant = "default"
}: ScorecardShareActionsProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [shareState, setShareState] = useState<"idle" | "shared">("idle");

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("error");
    }
  }, [shareUrl]);

  const shareScorecard = useCallback(async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl
        });
        setShareState("shared");
        window.setTimeout(() => setShareState("idle"), 2200);
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }
    await copyShareLink();
  }, [shareTitle, shareDescription, shareUrl, copyShareLink]);

  const shareHelper = (
    <p className="text-[0.48rem] leading-snug text-[var(--slop-cream-dim)] sm:text-[0.52rem]">
      Share copies your scorecard link. Post it anywhere — not a direct post to social.
    </p>
  );

  if (variant === "compact") {
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => void copyShareLink()}
          className="slop-scorecard-btn-pill"
          aria-label="Copy scorecard link"
        >
          {copyState === "copied"
            ? "Copied"
            : copyState === "error"
              ? "Copy failed"
              : "Copy link"}
        </button>
        <button
          type="button"
          onClick={() => void shareScorecard()}
          className="slop-scorecard-btn-pill slop-scorecard-btn-pill--muted"
          aria-label="Share this Slop Scorecard"
        >
          {shareState === "shared" ? "Shared" : "Share"}
        </button>
        </div>
        {shareHelper}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={() => void shareScorecard()}
        className="brand-cta inline-flex min-h-10 flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.06em]"
      >
        {shareState === "shared" ? "Shared" : "Share this Slop Scorecard"}
      </button>
      <button
        type="button"
        onClick={() => void copyShareLink()}
        className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-[var(--slop-gold)]/55 bg-[color:rgba(244,179,33,0.1)] px-4 py-2.5 text-xs font-black uppercase tracking-[0.06em] text-[var(--slop-gold-bright)] transition hover:bg-[color:rgba(244,179,33,0.18)]"
      >
        {copyState === "copied"
          ? "Link copied"
          : copyState === "error"
            ? "Copy failed"
            : "Copy scorecard link"}
      </button>
      </div>
      {shareHelper}
    </div>
  );
}
