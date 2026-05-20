import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { getAuthSecret } from "@/lib/auth/env";

/**
 * Next.js 16+ network boundary (replaces `middleware.ts`).
 * Admin routes: session cookie only — no Prisma (Vercel-safe).
 * DB role === ADMIN is enforced in server pages/actions via requireAdminAccess().
 */
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

  const hasSession = Boolean(token?.sub);

  if (!hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
