import type { ReviewHistoryVisibility } from "@prisma/client";

import { parseReviewHistoryVisibility } from "@/lib/reviewer-visibility";

const DANGEROUS_PROTOCOL = /^(javascript|data|vbscript|file):/i;
const HANDLE_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;

export type ReviewerExternalLink = {
  id: "instagram" | "tiktok" | "youtube" | "x" | "website";
  label: string;
  href: string;
};

export type ProfileSocialFieldErrors = Partial<
  Record<
    | "instagram"
    | "tiktok"
    | "youtube"
    | "x"
    | "website"
    | "reviewHistoryVisibility"
    | "form",
    string
  >
>;

export type StoredProfileSocial = {
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  xUrl: string | null;
  websiteUrl: string | null;
  socialLinksPublic: boolean;
  reviewHistoryVisibility: ReviewHistoryVisibility;
};

/** Social payload attached to public scorecards when the reviewer opted in. */
export type PublicReviewerSocialLinks = Pick<
  StoredProfileSocial,
  | "instagramUrl"
  | "tiktokUrl"
  | "youtubeUrl"
  | "xUrl"
  | "websiteUrl"
  | "socialLinksPublic"
>;

type SocialFieldKey = "instagram" | "tiktok" | "youtube" | "x" | "website";

const SOCIAL_FIELD_CONFIG: Record<
  SocialFieldKey,
  {
    dbKey: keyof Pick<
      StoredProfileSocial,
      "instagramUrl" | "tiktokUrl" | "youtubeUrl" | "xUrl" | "websiteUrl"
    >;
    label: string;
    hostPatterns: RegExp[];
    fromHandle: (handle: string) => string;
  }
> = {
  instagram: {
    dbKey: "instagramUrl",
    label: "Instagram",
    hostPatterns: [/^(www\.)?instagram\.com$/i],
    fromHandle: (handle) => `https://instagram.com/${handle}`
  },
  tiktok: {
    dbKey: "tiktokUrl",
    label: "TikTok",
    hostPatterns: [/^(www\.)?tiktok\.com$/i],
    fromHandle: (handle) => `https://tiktok.com/@${handle.replace(/^@+/, "")}`
  },
  youtube: {
    dbKey: "youtubeUrl",
    label: "YouTube",
    hostPatterns: [/^(www\.)?youtube\.com$/i, /^youtu\.be$/i],
    fromHandle: (handle) =>
      `https://youtube.com/@${handle.replace(/^@+/, "")}`
  },
  x: {
    dbKey: "xUrl",
    label: "X",
    hostPatterns: [/^(www\.)?(x|twitter)\.com$/i],
    fromHandle: (handle) => `https://x.com/${handle.replace(/^@+/, "")}`
  },
  website: {
    dbKey: "websiteUrl",
    label: "Website",
    hostPatterns: [],
    fromHandle: () => ""
  }
};

function stripHandle(raw: string): string {
  return raw.trim().replace(/^@+/, "");
}

function parseHttpUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed || DANGEROUS_PROTOCOL.test(trimmed)) {
    return null;
  }

  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    );
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
  if (!url.hostname || url.hostname.includes(" ")) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function normalizeSocialField(
  key: SocialFieldKey,
  raw: string
): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  if (DANGEROUS_PROTOCOL.test(trimmed)) {
    return null;
  }

  const config = SOCIAL_FIELD_CONFIG[key];

  if (key === "website") {
    const url = parseHttpUrl(trimmed);
    if (!url) {
      return null;
    }
    url.hash = "";
    return url.toString();
  }

  const asUrl = parseHttpUrl(trimmed);
  if (asUrl) {
    const host = asUrl.hostname.toLowerCase();
    if (!config.hostPatterns.some((pattern) => pattern.test(host))) {
      return null;
    }
    asUrl.hash = "";
    return asUrl.toString();
  }

  const handle = stripHandle(trimmed);
  if (!HANDLE_PATTERN.test(handle)) {
    return null;
  }
  return config.fromHandle(handle);
}

export function validateProfileSocialInput(input: {
  instagram: string;
  tiktok: string;
  youtube: string;
  x: string;
  website: string;
  socialLinksPublic: boolean;
  reviewHistoryVisibility: string;
}): { ok: true; data: StoredProfileSocial } | { ok: false; errors: ProfileSocialFieldErrors } {
  const errors: ProfileSocialFieldErrors = {};
  const visibility = parseReviewHistoryVisibility(input.reviewHistoryVisibility);

  if (!visibility) {
    errors.reviewHistoryVisibility = "Choose a review history visibility option.";
  }

  const normalized: Partial<StoredProfileSocial> = {
    socialLinksPublic: Boolean(input.socialLinksPublic),
    reviewHistoryVisibility: visibility ?? "HIGHLIGHTS_ONLY"
  };

  for (const key of Object.keys(SOCIAL_FIELD_CONFIG) as SocialFieldKey[]) {
    const raw =
      key === "instagram"
        ? input.instagram
        : key === "tiktok"
          ? input.tiktok
          : key === "youtube"
            ? input.youtube
            : key === "x"
              ? input.x
              : input.website;
    const value = normalizeSocialField(key, raw);
    if (raw.trim() && !value) {
      errors[key] = `Enter a valid ${SOCIAL_FIELD_CONFIG[key].label} handle or URL.`;
    }
    normalized[SOCIAL_FIELD_CONFIG[key].dbKey] = value;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: normalized as StoredProfileSocial
  };
}

export function buildReviewerExternalLinks(
  social: Pick<
    StoredProfileSocial,
  | "instagramUrl"
    | "tiktokUrl"
    | "youtubeUrl"
    | "xUrl"
    | "websiteUrl"
    | "socialLinksPublic"
  >
): ReviewerExternalLink[] {
  if (!social.socialLinksPublic) {
    return [];
  }

  const links: ReviewerExternalLink[] = [];
  const entries: [SocialFieldKey, string | null][] = [
    ["instagram", social.instagramUrl],
    ["tiktok", social.tiktokUrl],
    ["youtube", social.youtubeUrl],
    ["x", social.xUrl],
    ["website", social.websiteUrl]
  ];

  for (const [key, href] of entries) {
    if (!href) {
      continue;
    }
    const safe = normalizeSocialField(key, href);
    if (!safe) {
      continue;
    }
    links.push({
      id: key,
      label: SOCIAL_FIELD_CONFIG[key].label,
      href: safe
    });
  }

  return links;
}

/** Short label for preview / scorecard back. */
export function externalLinkDisplayLabel(link: ReviewerExternalLink): string {
  if (link.id === "website") {
    try {
      return new URL(link.href).hostname.replace(/^www\./, "");
    } catch {
      return link.label;
    }
  }
  return link.label;
}

export function socialUrlForForm(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

type ReviewerSocialUserFields = PublicReviewerSocialLinks;

/** Safe public social payload for scorecard back — undefined when hidden or empty. */
export function reviewerSocialForScorecard(
  user: ReviewerSocialUserFields
): PublicReviewerSocialLinks | undefined {
  if (!user.socialLinksPublic) {
    return undefined;
  }

  const payload: PublicReviewerSocialLinks = {
    instagramUrl: user.instagramUrl,
    tiktokUrl: user.tiktokUrl,
    youtubeUrl: user.youtubeUrl,
    xUrl: user.xUrl,
    websiteUrl: user.websiteUrl,
    socialLinksPublic: true
  };

  if (buildReviewerExternalLinks(payload).length === 0) {
    return undefined;
  }

  return payload;
}
