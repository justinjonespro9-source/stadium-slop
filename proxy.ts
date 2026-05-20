import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { ADMIN_LOGIN_NEXT_PATH, contributorLoginUrl } from "@/lib/auth/admin-routes";
import { getAuthSecret } from "@/lib/auth/env";

/**
 * Next.js 16+ network boundary (replaces `middleware.ts`).
 * Admin: session cookie only — no Prisma. Unsigned users go to /login (not /admin/login).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    const loginUrl = new URL(contributorLoginUrl(ADMIN_LOGIN_NEXT_PATH), request.url);
    return NextResponse.redirect(loginUrl);
  }

  const token = await getToken({
    req: request,
    secret: getAuthSecret()
  });

  if (!token?.sub) {
    const loginUrl = new URL(contributorLoginUrl(pathname), request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
