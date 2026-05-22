import "server-only";

import { UserRole } from "@prisma/client";

import { isAdminEmail } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

/** Env gate for admin QA test reviews (`1` or `true`). */
export function isAllowTestReviewsEnabled(): boolean {
  const raw = process.env.ALLOW_TEST_REVIEWS?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export type TestReviewModeStatus = {
  envEnabled: boolean;
  userIsAdmin: boolean;
  active: boolean;
};

export async function getTestReviewModeStatus(
  userId: string
): Promise<TestReviewModeStatus> {
  const envEnabled = isAllowTestReviewsEnabled();
  if (!envEnabled) {
    return { envEnabled: false, userIsAdmin: false, active: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true }
  });

  const userIsAdmin =
    user?.role === UserRole.ADMIN || isAdminEmail(user?.email ?? null);

  return {
    envEnabled,
    userIsAdmin,
    active: userIsAdmin
  };
}

/** True when this signed-in user may submit QA test reviews (admin + env). */
export async function canSubmitTestReviews(userId: string): Promise<boolean> {
  const status = await getTestReviewModeStatus(userId);
  return status.active;
}
