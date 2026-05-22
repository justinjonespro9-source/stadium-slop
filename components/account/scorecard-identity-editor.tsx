"use client";

import { useMemo, useState } from "react";

import { ScorecardIdentityPreview } from "@/components/account/scorecard-identity-preview";
import { authFieldClass, authLabelClass } from "@/components/auth-ui";
import {
  handleDisplayFromStored,
  handleInputFromStored
} from "@/lib/profile-identity-display";

type ScorecardIdentityEditorProps = {
  initialDisplayName: string;
  initialHandle: string;
  initials: string;
  avatarUrl: string | null | undefined;
  venuesReviewed: number;
  itemsReviewed: number;
  helpfulEarned: number;
  cloudinaryReady: boolean;
  updateScorecardIdentity: (formData: FormData) => Promise<void>;
  uploadProfileAvatar: (formData: FormData) => Promise<void>;
};

export function ScorecardIdentityEditor({
  initialDisplayName,
  initialHandle,
  initials,
  avatarUrl,
  venuesReviewed,
  itemsReviewed,
  helpfulEarned,
  cloudinaryReady,
  updateScorecardIdentity,
  uploadProfileAvatar
}: ScorecardIdentityEditorProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [handleInput, setHandleInput] = useState(handleInputFromStored(initialHandle));

  const handleDisplay = useMemo(() => {
    const body = handleInput.trim().replace(/^@+/, "");
    if (!body) {
      return "@";
    }
    return handleDisplayFromStored(body);
  }, [handleInput]);

  const previewInitials = useMemo(() => {
    const source = displayName.trim() || handleInput.trim() || "?";
    return (
      source
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?"
    );
  }, [displayName, handleInput]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
          How your Scorecard identity appears
        </p>
        <p className="mt-1 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
          Public on Slop Scorecards only — not a full profile page. Fan food photos stay on
          the card front; your avatar is your reviewer identity.
        </p>
        <div className="mt-3">
          <ScorecardIdentityPreview
            displayName={displayName.trim() || "Stadium fan"}
            handleDisplay={handleDisplay}
            initials={previewInitials}
            avatarUrl={avatarUrl}
            venuesReviewed={venuesReviewed}
            itemsReviewed={itemsReviewed}
            helpfulEarned={helpfulEarned}
          />
        </div>
      </div>

      <form action={updateScorecardIdentity} className="space-y-3 border-t border-[var(--slop-line)] pt-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
          Name &amp; handle
        </p>
        <label className={`block ${authLabelClass}`}>
          Display name
          <input
            name="displayName"
            type="text"
            required
            minLength={2}
            maxLength={40}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={`${authFieldClass} mt-1`}
            autoComplete="nickname"
          />
        </label>
        <label className={`block ${authLabelClass}`}>
          Handle
          <span className="mt-0.5 block text-[0.6rem] font-normal normal-case tracking-normal text-[var(--slop-cream-dim)]">
            Letters, numbers, and underscores · 3–24 characters
          </span>
          <span className="relative mt-1 flex items-center">
            <span className="pointer-events-none absolute left-3 text-sm font-bold text-[var(--slop-cream-dim)]">
              @
            </span>
            <input
              name="handle"
              type="text"
              required
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_]+"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value.replace(/^@+/, ""))}
              className={`${authFieldClass} pl-7`}
              autoComplete="username"
            />
          </span>
        </label>
        <button
          type="submit"
          className="brand-cta inline-flex min-h-9 items-center rounded-lg px-4 py-2 text-xs font-black"
        >
          Save identity
        </button>
      </form>

      <div className="border-t border-[var(--slop-line)] pt-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
          Profile photo
        </p>
        <p className="mt-1 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
          Same Cloudinary upload path as fan photos (~8MB, JPEG/PNG/WebP/GIF). Dedicated
          avatar moderation is not wired yet — flagged-photo review covers reported content.
        </p>
        {cloudinaryReady ? (
          <form action={uploadProfileAvatar} className="mt-3 space-y-2">
            <label className={`block ${authLabelClass}`}>
              <span className="sr-only">Choose profile photo</span>
              <input
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={`${authFieldClass} py-2 text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--slop-orange)] file:px-2.5 file:py-1.5 file:text-[0.65rem] file:font-black file:text-[var(--slop-ink)]`}
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-9 items-center rounded-lg border border-[var(--slop-gold)]/50 bg-[color:rgba(244,179,33,0.12)] px-4 py-2 text-xs font-black text-[var(--slop-gold-bright)] transition hover:bg-[color:rgba(244,179,33,0.2)]"
            >
              Save photo
            </button>
          </form>
        ) : (
          <p className="mt-2 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
            Add Cloudinary env vars on the server to enable profile photo uploads.
          </p>
        )}
      </div>
    </div>
  );
}
