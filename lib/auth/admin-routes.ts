/** Canonical post-sign-in target for admin area (single Google OAuth entry: /login). */
export const ADMIN_LOGIN_NEXT_PATH = "/admin";

export function contributorLoginUrl(nextPath = ADMIN_LOGIN_NEXT_PATH) {
  const safeNext =
    nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : ADMIN_LOGIN_NEXT_PATH;
  return `/login?next=${encodeURIComponent(safeNext)}`;
}
