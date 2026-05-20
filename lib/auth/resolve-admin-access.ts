import "server-only";

import { UserRole, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function isUserAdminById(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role === UserRole.ADMIN;
}

export async function resolveAdminAccessForEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, role: true, email: true }
  });

  return {
    isAdmin: user?.role === UserRole.ADMIN,
    dbRole: user?.role ?? null,
    email: user?.email ?? null,
    userId: user?.id ?? null
  };
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
    select: { id: true, role: true, email: true }
  });

  return {
    isAdmin: user?.role === UserRole.ADMIN,
    dbRole: user?.role ?? null,
    email: user?.email ?? null,
    userId: user?.id ?? null
  };
}
