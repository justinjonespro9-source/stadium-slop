import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  isUserAdminById,
  logAdminAccessCheck,
  resolveAdminAccessForUserId
} from "@/lib/auth/resolve-admin-access";

/** Server layouts/actions: Google session + live Prisma User.role === ADMIN. */
export async function requireAdminAccess() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/admin/login");
  }

  const { isAdmin, dbRole } = await resolveAdminAccessForUserId(userId);

  logAdminAccessCheck("requireAdminAccess", {
    userId,
    jwtRole: session.user.role ?? null,
    jwtIsAdmin: session.user.isAdmin ?? null,
    dbRole,
    allowed: isAdmin
  });

  if (!isAdmin) {
    redirect("/admin/login?error=not-admin");
  }
}
