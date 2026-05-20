import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  logAdminAccessCheck,
  resolveAdminAccessForEmail,
  resolveAdminAccessForUserId
} from "@/lib/auth/resolve-admin-access";

/** Server pages/actions: Google session + live Prisma User.role === ADMIN. */
export async function requireAdminAccess() {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email?.trim().toLowerCase() ?? null;

  if (!userId && !email) {
    redirect("/admin/login");
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
    redirect("/admin/login?error=not-admin");
  }
}
