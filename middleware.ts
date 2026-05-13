import { NextResponse, type NextRequest } from "next/server";

import {
  MOCK_ADMIN_COOKIE_NAME,
  hasMockAdminAccess
} from "@/lib/admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
