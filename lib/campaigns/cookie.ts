import { getActiveCampaign, normalizeCampaignSlug } from "@/lib/campaigns/catalog";

/** First-touch campaign slug. Survives the session so signup/review can correlate. */
export const CAMPAIGN_COOKIE_NAME = "ss_campaign";

/** Session marker so /follow refresh does not double-count the same browser. */
export const FOLLOW_TOUCH_COOKIE_NAME = "ss_follow_touch";

export const CAMPAIGN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export type CampaignCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge?: number;
};

export function campaignCookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

export function firstTouchCookieOptions(): CampaignCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: campaignCookieSecure(),
    path: "/",
    maxAge: CAMPAIGN_COOKIE_MAX_AGE_SECONDS
  };
}

export function followTouchCookieOptions(): CampaignCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: campaignCookieSecure(),
    path: "/"
  };
}

export function resolveActiveCampaignSlug(
  raw: string | null | undefined
): string | null {
  const slug = normalizeCampaignSlug(raw);
  return getActiveCampaign(slug)?.slug ?? null;
}
