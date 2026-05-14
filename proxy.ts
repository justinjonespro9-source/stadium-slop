import { NextResponse, type NextRequest } from "next/server";

import {
  MOCK_ADMIN_COOKIE_NAME,
  hasMockAdminAccess
} from "@/lib/admin-auth";

/** Next.js 16+ convention: network boundary before the app (replaces `middleware.ts`). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Defense in depth: never run admin logic on public routes even if matcher regressed.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const adminCookie = request.cookies.get(MOCK_ADMIN_COOKIE_NAME)?.value;

  if (!hasMockAdminAccess(adminCookie)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
