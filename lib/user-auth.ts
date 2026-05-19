export const MOCK_USER_COOKIE_NAME = "stadium-slop-user";
export const MOCK_USER_COOKIE_VALUE = "mock-reviewer-profile";
export const MOCK_USER_SESSION_SECONDS = 60 * 60 * 24 * 14;
export const MOCK_REVIEWER_USER_ID = "user-seat126snacks";
export const MOCK_REVIEWER_EMAIL = "seat126snacks@example.com";

export const mockReviewerProfile = {
  displayName: "Section 126 Snack Scout",
  handle: "@seat126snacks",
  homeVenue: "Target Field",
  initials: "SS"
};

export function hasMockUserAccess(cookieValue?: string) {
  return cookieValue === MOCK_USER_COOKIE_VALUE;
}

/** Dev-only mock fan cookie — NODE_ENV=development and ENABLE_MOCK_USER_AUTH=true */
export function allowMockUserAccess(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_MOCK_USER_AUTH === "true"
  );
}

export async function isContributorSignedIn(
  cookieValue?: string
): Promise<boolean> {
  if (allowMockUserAccess() && hasMockUserAccess(cookieValue)) {
    return true;
  }

  const { getSessionUser } = await import("@/lib/auth/require-user");
  const user = await getSessionUser();
  return Boolean(user?.id);
}
