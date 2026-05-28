"use client";

import { useEffect, useState, type ReactNode } from "react";

import { ALCOHOL_HIDDEN_MESSAGE } from "@/components/age-gate/alcohol-hidden-standing-row";
import { AgeConfirmationPrompt } from "@/components/age-gate/age-confirmation-prompt";
import { useAgeGate } from "@/components/age-gate/age-gate-context";

type FoodItemAgeGateProps = {
  alcoholRelated: boolean;
  children: ReactNode;
  tone?: "brand" | "media";
};

export function FoodItemAgeGate({
  alcoholRelated,
  children,
  tone = "brand"
}: FoodItemAgeGateProps) {
  const { status, isConfirmed } = useAgeGate();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (alcoholRelated && status === "unknown") {
      setShowPrompt(true);
    }
  }, [alcoholRelated, status]);

  if (!alcoholRelated) {
    return <>{children}</>;
  }

  if (isConfirmed) {
    return <>{children}</>;
  }

  return (
    <div className="relative mt-3">
      {status === "declined" || (status === "unknown" && showPrompt) ? (
        <AgeConfirmationPrompt className="mb-3" tone={tone} />
      ) : null}
      <div
        className="pointer-events-none select-none blur-md opacity-40"
        aria-hidden="true"
      >
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex items-start justify-center px-2 pt-8 sm:px-4">
        <div
          className={
            tone === "media"
              ? "media-content-card max-w-md px-4 py-3 text-center"
              : "max-w-md rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.92)] px-4 py-3 text-center shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
          }
        >
          <p
            className={`text-sm font-black ${
              tone === "media" ? "text-[var(--media-ink)]" : "text-[var(--slop-cream)]"
            }`}
          >
            {ALCOHOL_HIDDEN_MESSAGE}
          </p>
          {status === "declined" ? (
            <p
              className={`mt-2 text-[0.7rem] leading-snug sm:text-xs ${
                tone === "media" ? "text-[var(--media-ink-muted)]" : "text-[var(--slop-cream-dim)]"
              }`}
            >
              Use &ldquo;Yes, I&apos;m 21+&rdquo; above if you want to view this listing.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
