import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16+ network boundary (replaces `middleware.ts`).
 *
 * Admin routes (`/admin`, `/admin/*`) are NOT matched or redirected here.
 * Authorization is server-only via `requireAdminAccess()` on admin pages and
 * server actions. Edge/proxy `getToken()` checks caused redirect loops on Vercel
 * (session visible to `auth()` but missing in proxy, or PKCE churn on /admin/login).
 *
 * Add a `config.matcher` below only for non-admin paths when needed.
 */
export async function proxy(_request: NextRequest) {
  return NextResponse.next();
}
