"use client";

import { useMemo, useState } from "react";

import { ScorecardIdentityPreview } from "@/components/account/scorecard-identity-preview";
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
        <p className="media-section-eyebrow">Preview</p>
        <p className="mt-1 text-[0.7rem] leading-snug text-[var(--media-ink-muted)]">
          One reviewer avatar powers your name on every Slop Scorecard (round on the front
          strip, square on the back). The large photo on each card front is the fan food
          photo from that review — uploaded when you submit a review, not here.
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

      <form
        action={updateScorecardIdentity}
        className="space-y-3 border-t border-[var(--media-border)] pt-4"
      >
        <p className="media-form-label">Name &amp; handle</p>
        <label className="media-form-label">
          Display name
          <input
            name="displayName"
            type="text"
            required
            minLength={2}
            maxLength={40}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="media-form-field mt-1 font-normal normal-case tracking-normal"
            autoComplete="nickname"
          />
        </label>
        <label className="media-form-label">
          Handle
          <span className="mt-0.5 block text-[0.65rem] font-medium normal-case tracking-normal text-[var(--media-ink-muted)]">
            Letters, numbers, and underscores · 3–24 characters
          </span>
          <span className="relative mt-1 flex items-center">
            <span className="pointer-events-none absolute left-3 text-sm font-bold text-[var(--media-ink-muted)]">
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
              className="media-form-field pl-7 font-normal normal-case tracking-normal"
              autoComplete="username"
            />
          </span>
        </label>
        <button
          type="submit"
          className="media-cta inline-flex min-h-9 items-center rounded-full px-4 py-2 text-xs font-black"
        >
          Save identity
        </button>
      </form>

      <div className="border-t border-[var(--media-border)] pt-4">
        <p className="media-form-label">Reviewer avatar</p>
        <p className="mt-1 text-[0.7rem] leading-snug text-[var(--media-ink-muted)]">
          This is your Scorecard identity photo only — not the fan food photo on the card
          front. Same Cloudinary path as review photos (~8MB, JPEG/PNG/WebP/GIF).
        </p>
        {cloudinaryReady ? (
          <form action={uploadProfileAvatar} className="mt-3 space-y-2">
            <label className="media-form-label">
              <span className="sr-only">Choose profile photo</span>
              <input
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="media-form-field py-2 text-xs file:mr-2 file:rounded-full file:border-0 file:bg-[var(--media-orange)] file:px-2.5 file:py-1.5 file:text-[0.65rem] file:font-black file:text-white"
              />
            </label>
            <button
              type="submit"
              className="media-secondary-button min-h-9 px-4 py-2 text-xs"
            >
              Save photo
            </button>
          </form>
        ) : (
          <p className="mt-2 text-[0.7rem] leading-snug text-[var(--media-ink-muted)]">
            Add Cloudinary env vars on the server to enable profile photo uploads.
          </p>
        )}
      </div>
    </div>
  );
}
