import "server-only";

import { cookies } from "next/headers";

import { getActiveCampaign } from "@/lib/campaigns/catalog";
import { CAMPAIGN_COOKIE_NAME, resolveActiveCampaignSlug } from "@/lib/campaigns/cookie";

/** First-touch slug from the httpOnly campaign cookie, if the campaign is still active. */
export async function getFirstTouchCampaignSlugFromCookies(): Promise<string | null> {
  try {
    const store = await cookies();
    return resolveActiveCampaignSlug(store.get(CAMPAIGN_COOKIE_NAME)?.value);
  } catch {
    return null;
  }
}

export async function getFirstTouchCampaignFromCookies() {
  const slug = await getFirstTouchCampaignSlugFromCookies();
  return slug ? getActiveCampaign(slug) : null;
}
