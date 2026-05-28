"use client";

import { useAgeGate } from "@/components/age-gate/age-gate-context";

type AgeConfirmationPromptProps = {
  className?: string;
  tone?: "brand" | "media";
};

/**
 * Honor-system age check — not legal ID verification.
 */
export function AgeConfirmationPrompt({
  className = "",
  tone = "brand"
}: AgeConfirmationPromptProps) {
  const { confirm21Plus, decline21Plus } = useAgeGate();
  const shellClass =
    tone === "media"
      ? "media-age-prompt rounded-xl border px-3 py-3 sm:px-4 sm:py-4"
      : "rounded-xl border border-[color:rgba(244,179,33,0.35)] bg-[color:rgba(11,27,43,0.95)] px-3 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:px-4 sm:py-4";

  return (
    <div
      role="dialog"
      aria-labelledby="age-confirm-title"
      aria-describedby="age-confirm-desc"
      className={`${shellClass} ${className}`}
    >
      <p
        id="age-confirm-title"
        className={`text-sm font-black sm:text-base ${
          tone === "media" ? "media-age-prompt-title" : "text-[var(--slop-cream)]"
        }`}
      >
        Are you 21 or older?
      </p>
      <p
        id="age-confirm-desc"
        className={`mt-1.5 text-[0.7rem] leading-snug sm:text-xs ${
          tone === "media" ? "media-age-prompt-desc" : "text-[var(--slop-cream-dim)]"
        }`}
      >
        Alcohol-related listings use an honor-system check only — we do not verify
        your age or collect your date of birth.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={confirm21Plus}
          className={
            tone === "media"
              ? "media-primary-button px-4 py-2 text-xs sm:text-sm"
              : "brand-cta rounded-full px-4 py-2 text-xs font-black sm:text-sm"
          }
        >
          Yes, I&apos;m 21+
        </button>
        <button
          type="button"
          onClick={decline21Plus}
          className={
            tone === "media"
              ? "media-cta-outline px-4 py-2 text-xs"
              : "rounded-full border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.65)] px-4 py-2 text-xs font-bold text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-line)] hover:text-[var(--slop-cream)]"
          }
        >
          No
        </button>
      </div>
    </div>
  );
}
