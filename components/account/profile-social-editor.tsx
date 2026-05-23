"use client";

import { useMemo, useState } from "react";
import type { ReviewHistoryVisibility } from "@prisma/client";

import { ReviewerExternalLinks } from "@/components/reviewer-external-links";
import { authFieldClass, authLabelClass } from "@/components/auth-ui";
import {
  buildReviewerExternalLinks,
  socialUrlForForm,
  type StoredProfileSocial
} from "@/lib/profile-social-links";
import { REVIEW_HISTORY_VISIBILITY_OPTIONS } from "@/lib/reviewer-visibility";

type ProfileSocialEditorProps = {
  initialSocial: StoredProfileSocial;
  updateProfileSocialSettings: (formData: FormData) => Promise<void>;
};

const SOCIAL_FIELDS = [
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "@handle or instagram.com/you"
  },
  {
    name: "tiktok",
    label: "TikTok",
    placeholder: "@handle or tiktok.com/@you"
  },
  {
    name: "youtube",
    label: "YouTube",
    placeholder: "@channel or youtube.com/@you"
  },
  {
    name: "x",
    label: "X / Twitter",
    placeholder: "@handle or x.com/you"
  },
  {
    name: "website",
    label: "Website",
    placeholder: "https://your-site.com"
  }
] as const;

export function ProfileSocialEditor({
  initialSocial,
  updateProfileSocialSettings
}: ProfileSocialEditorProps) {
  const [instagram, setInstagram] = useState(
    socialUrlForForm(initialSocial.instagramUrl)
  );
  const [tiktok, setTiktok] = useState(socialUrlForForm(initialSocial.tiktokUrl));
  const [youtube, setYoutube] = useState(
    socialUrlForForm(initialSocial.youtubeUrl)
  );
  const [x, setX] = useState(socialUrlForForm(initialSocial.xUrl));
  const [website, setWebsite] = useState(
    socialUrlForForm(initialSocial.websiteUrl)
  );
  const [socialLinksPublic, setSocialLinksPublic] = useState(
    initialSocial.socialLinksPublic
  );
  const [reviewHistoryVisibility, setReviewHistoryVisibility] =
    useState<ReviewHistoryVisibility>(initialSocial.reviewHistoryVisibility);

  const fieldValues: Record<(typeof SOCIAL_FIELDS)[number]["name"], string> = {
    instagram,
    tiktok,
    youtube,
    x,
    website
  };

  const fieldSetters: Record<
    (typeof SOCIAL_FIELDS)[number]["name"],
    (value: string) => void
  > = {
    instagram: setInstagram,
    tiktok: setTiktok,
    youtube: setYoutube,
    x: setX,
    website: setWebsite
  };

  const previewSocial = useMemo(
    (): StoredProfileSocial => ({
      instagramUrl: instagram.trim() || null,
      tiktokUrl: tiktok.trim() || null,
      youtubeUrl: youtube.trim() || null,
      xUrl: x.trim() || null,
      websiteUrl: website.trim() || null,
      socialLinksPublic,
      reviewHistoryVisibility
    }),
    [
      instagram,
      tiktok,
      youtube,
      x,
      website,
      socialLinksPublic,
      reviewHistoryVisibility
    ]
  );

  const previewLinks = useMemo(
    () => buildReviewerExternalLinks(previewSocial),
    [previewSocial]
  );

  const selectedVisibility = REVIEW_HISTORY_VISIBILITY_OPTIONS.find(
    (option) => option.value === reviewHistoryVisibility
  );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.35)] px-3 py-3">
        <p className="text-[0.65rem] leading-relaxed text-[var(--slop-cream-dim)]">
          Stadium Slop is food-first — not a follower platform. Optional links help
          fans find you elsewhere; your Slop Cards stay tied to the items and venues
          you review.
        </p>
      </div>

      <form action={updateProfileSocialSettings} className="space-y-4">
        <fieldset className="space-y-3">
          <legend className={`${authLabelClass} mb-1 block`}>
            External links <span className="font-normal normal-case">(optional)</span>
          </legend>
          {SOCIAL_FIELDS.map((field) => (
            <label key={field.name} className={`block ${authLabelClass}`}>
              {field.label}
              <input
                name={field.name}
                type="text"
                inputMode="url"
                autoComplete="off"
                maxLength={200}
                value={fieldValues[field.name]}
                onChange={(event) =>
                  fieldSetters[field.name](event.target.value)
                }
                placeholder={field.placeholder}
                className={`${authFieldClass} mt-1 font-normal normal-case tracking-normal`}
              />
            </label>
          ))}
        </fieldset>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--slop-line)] px-3 py-2.5">
          <input
            type="checkbox"
            name="socialLinksPublic"
            checked={socialLinksPublic}
            onChange={(event) => setSocialLinksPublic(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--slop-gold)]"
          />
          <span className="text-[0.7rem] leading-snug text-[var(--slop-cream-muted)]">
            <span className="font-bold text-[var(--slop-cream)]">
              Show links on my Slop Scorecards
            </span>
            <span className="mt-0.5 block text-[var(--slop-cream-dim)]">
              Fans see a small &ldquo;Find me elsewhere&rdquo; area on the back of your
              cards when you add links.
            </span>
          </span>
        </label>

        <fieldset className="space-y-2 border-t border-[var(--slop-line)] pt-4">
          <legend className={`${authLabelClass} mb-2 block`}>
            Review history visibility
          </legend>
          <p className="text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
            Controls how much of your past Slop Cards fans can browse beyond each
            food item. Reviews always appear on the items you rated.
          </p>
          <ul className="mt-2 space-y-2">
            {REVIEW_HISTORY_VISIBILITY_OPTIONS.map((option) => (
              <li key={option.value}>
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--slop-line-strong)] px-3 py-2.5 transition has-[:checked]:border-[var(--slop-gold)]/45 has-[:checked]:bg-[color:rgba(244,179,33,0.06)]">
                  <input
                    type="radio"
                    name="reviewHistoryVisibility"
                    value={option.value}
                    checked={reviewHistoryVisibility === option.value}
                    onChange={() => setReviewHistoryVisibility(option.value)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--slop-gold)]"
                  />
                  <span className="min-w-0 text-[0.7rem] leading-snug">
                    <span className="font-bold text-[var(--slop-cream)]">
                      {option.label}
                      {option.recommended ? (
                        <span className="ml-1.5 text-[0.6rem] font-black uppercase tracking-[0.08em] text-[var(--slop-gold-bright)]">
                          Recommended
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-[var(--slop-cream-dim)]">
                      {option.description}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <button
          type="submit"
          className="brand-cta inline-flex min-h-9 items-center rounded-lg px-4 py-2 text-xs font-black"
        >
          Save reviewer profile
        </button>
      </form>

      <div className="border-t border-[var(--slop-line)] pt-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
          Preview
        </p>
        <p className="mt-1 text-[0.65rem] leading-snug text-[var(--slop-cream-dim)]">
          {selectedVisibility?.description}
        </p>
        {socialLinksPublic && previewLinks.length > 0 ? (
          <div className="mt-3 rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.45)] px-3 py-3">
            <ReviewerExternalLinks social={previewSocial} />
          </div>
        ) : socialLinksPublic ? (
          <p className="mt-2 text-[0.65rem] italic text-[var(--slop-cream-dim)]">
            Add at least one link above to preview how fans will see them.
          </p>
        ) : (
          <p className="mt-2 text-[0.65rem] italic text-[var(--slop-cream-dim)]">
            External links are hidden until you enable &ldquo;Show links on my Slop
            Scorecards.&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
