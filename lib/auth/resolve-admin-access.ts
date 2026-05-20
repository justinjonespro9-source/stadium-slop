import "server-only";

import { UserRole, type User } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

import { prisma } from "@/lib/prisma";

export async function isUserAdminById(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role === UserRole.ADMIN;
}

/**
 * Admin gate for proxy/middleware: valid signed session (token.sub) + live DB role.
 * getToken() does not run Auth.js jwt callbacks, so JWT role may lag after make-admin.
 */
export async function isAdminFromJwtToken(token: JWT | null): Promise<boolean> {
  if (!token?.sub) {
    return false;
  }
  return isUserAdminById(token.sub);
}

/** Dev-only diagnostics — never log secrets or full tokens. */
export function logAdminAccessCheck(
  context: string,
  details: {
    path?: string;
    userId?: string | null;
    jwtRole?: string | null;
    jwtIsAdmin?: boolean | null;
    dbRole?: User["role"] | null;
    allowed: boolean;
  }
) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info(`[admin-auth:${context}]`, {
    path: details.path,
    userId: details.userId ?? null,
    jwtRole: details.jwtRole ?? null,
    jwtIsAdmin: details.jwtIsAdmin ?? null,
    dbRole: details.dbRole ?? null,
    allowed: details.allowed
  });
}

export async function resolveAdminAccessForUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true }
  });

  return {
    isAdmin: user?.role === UserRole.ADMIN,
    dbRole: user?.role ?? null,
    email: user?.email ?? null
  };
}
