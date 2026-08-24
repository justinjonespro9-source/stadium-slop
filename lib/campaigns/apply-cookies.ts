import type { NextRequest, NextResponse } from "next/server";

import { isActiveCampaignSlug } from "@/lib/campaigns/catalog";
import {
  CAMPAIGN_COOKIE_NAME,
  FOLLOW_TOUCH_COOKIE_NAME,
  firstTouchCookieOptions,
  followTouchCookieOptions,
  resolveActiveCampaignSlug
} from "@/lib/campaigns/cookie";

export type CampaignCookiePlan = {
  firstTouchSlug: string | null;
  setFirstTouch: boolean;
  followTouchSlug: string | null;
};

export function planCampaignCookies(input: {
  pathname: string;
  src: string | null | undefined;
  existingCampaignSlug: string | null | undefined;
  existingFollowTouchSlug: string | null | undefined;
}): CampaignCookiePlan {
  const srcSlug = resolveActiveCampaignSlug(input.src);
  const existing = resolveActiveCampaignSlug(input.existingCampaignSlug);
  const firstTouchSlug = existing ?? srcSlug;
  const isFollow = input.pathname === "/follow" || input.pathname === "/follow/";
  const followAlreadyLogged =
    firstTouchSlug != null &&
    resolveActiveCampaignSlug(input.existingFollowTouchSlug) === firstTouchSlug;

  return {
    firstTouchSlug,
    setFirstTouch: existing == null && srcSlug != null,
    followTouchSlug: isFollow && firstTouchSlug && !followAlreadyLogged ? firstTouchSlug : null
  };
}

export function applyCampaignCookiesFromRequest(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const plan = planCampaignCookies({
    pathname: request.nextUrl.pathname,
    src: request.nextUrl.searchParams.get("src"),
    existingCampaignSlug: request.cookies.get(CAMPAIGN_COOKIE_NAME)?.value,
    existingFollowTouchSlug: request.cookies.get(FOLLOW_TOUCH_COOKIE_NAME)?.value
  });

  if (plan.setFirstTouch && plan.firstTouchSlug) {
    response.cookies.set(
      CAMPAIGN_COOKIE_NAME,
      plan.firstTouchSlug,
      firstTouchCookieOptions()
    );
  }

  if (plan.followTouchSlug) {
    response.cookies.set(
      FOLLOW_TOUCH_COOKIE_NAME,
      plan.followTouchSlug,
      followTouchCookieOptions()
    );
  }

  return response;
}

export function applyFirstTouchCampaignCookie(
  response: NextResponse,
  slug: string,
  existingRaw: string | null | undefined
): void {
  if (!isActiveCampaignSlug(slug)) {
    return;
  }
  if (resolveActiveCampaignSlug(existingRaw)) {
    return;
  }
  response.cookies.set(CAMPAIGN_COOKIE_NAME, slug, firstTouchCookieOptions());
}
