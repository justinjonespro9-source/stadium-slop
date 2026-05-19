/** Dev-only mock admin cookie — never enable in production. */

export const MOCK_ADMIN_COOKIE_NAME = "stadium-slop-admin";
export const MOCK_ADMIN_COOKIE_VALUE = "sng-labs-dev-admin";
export const MOCK_ADMIN_SESSION_SECONDS = 60 * 60 * 8;

/** Dev-only cookie admin — requires NODE_ENV=development and ENABLE_MOCK_ADMIN=true */
export function allowMockAdminAccess(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_MOCK_ADMIN === "true"
  );
}

export function hasMockAdminAccess(cookieValue?: string) {
  return cookieValue === MOCK_ADMIN_COOKIE_VALUE;
}
