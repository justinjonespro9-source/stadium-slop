export const MOCK_ADMIN_COOKIE_NAME = "stadium-slop-admin";
export const MOCK_ADMIN_COOKIE_VALUE = "sng-labs-dev-admin";
export const MOCK_ADMIN_SESSION_SECONDS = 60 * 60 * 8;

export function hasMockAdminAccess(cookieValue?: string) {
  return cookieValue === MOCK_ADMIN_COOKIE_VALUE;
}
