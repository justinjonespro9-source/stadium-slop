import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ADMIN_LOGIN_NEXT_PATH, contributorLoginUrl } from "@/lib/auth/admin-routes";
import {
  logAdminAccessCheck,
  resolveAdminAccessForEmail,
  resolveAdminAccessForUserId
} from "@/lib/auth/resolve-admin-access";

export type AdminAccessContext = {
  userId: string;
  email: string | null;
  dbRole: string;
};

/**
 * Server pages/actions only — never call from proxy/middleware.
 * Google sign-in entry: `/login` (not `/admin/login`).
 */
export async function requireAdminAccess(): Promise<AdminAccessContext> {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email?.trim().toLowerCase() ?? null;

  if (!userId && !email) {
    redirect(contributorLoginUrl(ADMIN_LOGIN_NEXT_PATH));
  }

  const access = userId
    ? await resolveAdminAccessForUserId(userId)
    : await resolveAdminAccessForEmail(email!);

  logAdminAccessCheck("requireAdminAccess", {
    userId: userId ?? access.userId ?? null,
    jwtRole: session?.user?.role ?? null,
    jwtIsAdmin: session?.user?.isAdmin ?? null,
    dbRole: access.dbRole,
    allowed: access.isAdmin
  });

  if (!access.isAdmin) {
    redirect("/account?error=not-admin");
  }

  const resolvedUserId = userId ?? access.userId;
  if (!resolvedUserId) {
    redirect(contributorLoginUrl(ADMIN_LOGIN_NEXT_PATH));
  }

  return {
    userId: resolvedUserId,
    email: access.email ?? session?.user?.email ?? null,
    dbRole: access.dbRole ?? "ADMIN"
  };
}
