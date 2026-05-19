import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  allowMockAdminAccess,
  hasMockAdminAccess,
  MOCK_ADMIN_COOKIE_NAME
} from "@/lib/admin-auth";
import { isAdminEmail } from "@/lib/auth/admin";

export async function requireAdminAccess() {
  if (allowMockAdminAccess()) {
    const cookieStore = await cookies();
    if (hasMockAdminAccess(cookieStore.get(MOCK_ADMIN_COOKIE_NAME)?.value)) {
      return;
    }
  }

  const session = await auth();
  const email = session?.user?.email;
  const isAdmin =
    session?.user?.isAdmin === true ||
    session?.user?.role === "ADMIN" ||
    isAdminEmail(email);

  if (!session?.user?.id || !isAdmin) {
    redirect(
      email ? "/admin/login?error=not-admin" : "/admin/login"
    );
  }
}
