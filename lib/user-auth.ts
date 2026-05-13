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
