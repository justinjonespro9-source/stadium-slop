import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  MOCK_ADMIN_COOKIE_NAME,
  allowMockAdminAccess,
  hasMockAdminAccess
} from "@/lib/admin-auth";
import { isAdminEmail } from "@/lib/auth/admin";

function authSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

/** Next.js 16+ convention: network boundary before the app (replaces `middleware.ts`). */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (allowMockAdminAccess()) {
    const mockCookie = request.cookies.get(MOCK_ADMIN_COOKIE_NAME)?.value;
    if (hasMockAdminAccess(mockCookie)) {
      return NextResponse.next();
    }
  }

  const token = await getToken({
    req: request,
    secret: authSecret()
  });

  const email =
    typeof token?.email === "string" ? token.email.toLowerCase() : null;
  const isAdmin =
    token?.isAdmin === true ||
    token?.role === "ADMIN" ||
    (email ? isAdminEmail(email) : false);

  if (!token?.sub || !isAdmin) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    if (token?.sub && !isAdmin) {
      loginUrl.searchParams.set("error", "not-admin");
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
