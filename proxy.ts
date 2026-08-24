import { NextResponse, type NextRequest } from "next/server";

import { applyCampaignCookiesFromRequest } from "@/lib/campaigns/apply-cookies";

/**
 * Next.js 16+ network boundary (replaces `middleware.ts`).
 *
 * Admin routes (`/admin`, `/admin/*`) are NOT matched or redirected here.
 * Authorization is server-only via `requireAdminAccess()` on admin pages and
 * server actions. Edge/proxy `getToken()` checks caused redirect loops on Vercel
 * (session visible to `auth()` but missing in proxy, or PKCE churn on /admin/login).
 *
 * Campaign first-touch cookies are set here for `/follow?src=` and any other
 * public URL that carries `?src=<campaign-slug>`. `/go/[slug]` sets the same
 * cookie from its route handler.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  return applyCampaignCookiesFromRequest(request, response);
}
