import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";

/** Server layouts/actions: real Google session with Prisma User.role === ADMIN. */
export async function requireAdminAccess() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  if (!session?.user?.id || !isAdmin) {
    redirect(
      session?.user?.email
        ? "/admin/login?error=not-admin"
        : "/admin/login"
    );
  }
}
