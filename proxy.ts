import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { getAuthSecret } from "@/lib/auth/env";

/** Next.js 16+ convention: network boundary before the app (replaces `middleware.ts`). */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: getAuthSecret()
  });

  const isAdmin = token?.role === "ADMIN";

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
