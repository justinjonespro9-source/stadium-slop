import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/require-user";
import { ensureMockReviewerUser } from "@/lib/mock-user";
import {
  MOCK_USER_COOKIE_NAME,
  allowMockUserAccess,
  hasMockUserAccess
} from "@/lib/user-auth";

/** Signed-in contributor id (Google session or dev mock cookie). */
export async function getContributorUserId(): Promise<string | null> {
  const sessionUser = await getSessionUser();
  if (sessionUser?.id) {
    return sessionUser.id;
  }

  const cookieStore = await cookies();
  const mockCookie = cookieStore.get(MOCK_USER_COOKIE_NAME)?.value;

  if (allowMockUserAccess() && hasMockUserAccess(mockCookie)) {
    const user = await ensureMockReviewerUser();
    return user.id;
  }

  return null;
}

export async function requireContributorUserId(
  nextPath: string
): Promise<string> {
  const userId = await getContributorUserId();

  if (userId) {
    return userId;
  }

  redirect(`/login?next=${encodeURIComponent(nextPath)}`);
}
