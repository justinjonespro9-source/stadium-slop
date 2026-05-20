import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { getAuthSecret } from "@/lib/auth/env";
import {
  logAdminAccessCheck,
  resolveAdminAccessForUserId
} from "@/lib/auth/resolve-admin-access";

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

  const userId = typeof token?.sub === "string" ? token.sub : null;

  if (!userId) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { isAdmin, dbRole } = await resolveAdminAccessForUserId(userId);
  const jwtClaimsAdmin =
    token?.role === "ADMIN" || token?.isAdmin === true;

  logAdminAccessCheck("proxy", {
    path: pathname,
    userId,
    jwtRole: typeof token?.role === "string" ? token.role : null,
    jwtIsAdmin: token?.isAdmin === true,
    dbRole,
    allowed: isAdmin
  });

  if (!isAdmin) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    loginUrl.searchParams.set("error", "not-admin");
    if (jwtClaimsAdmin && dbRole !== "ADMIN") {
      loginUrl.searchParams.set("hint", "stale-session");
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
