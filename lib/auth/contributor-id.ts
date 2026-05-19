import "server-only";

import { cookies } from "next/headers";

import { getSessionUser } from "@/lib/auth/require-user";
import { ensureMockReviewerUser } from "@/lib/mock-user";
import {
  MOCK_USER_COOKIE_NAME,
  allowMockUserAccess,
  hasMockUserAccess
} from "@/lib/user-auth";

/** Signed-in contributor id (Google session or dev mock cookie). */
export async function getContributorUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const mockCookie = cookieStore.get(MOCK_USER_COOKIE_NAME)?.value;

  if (allowMockUserAccess() && hasMockUserAccess(mockCookie)) {
    const user = await ensureMockReviewerUser();
    return user.id;
  }

  const sessionUser = await getSessionUser();
  return sessionUser?.id ?? null;
}

export async function requireContributorUserId(nextPath: string): Promise<string> {
  const userId = await getContributorUserId();
  if (userId) {
    return userId;
  }

  const { redirect } = await import("next/navigation");
  redirect(`/login?next=${encodeURIComponent(nextPath)}`);
}
