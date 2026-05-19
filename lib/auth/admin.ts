import "server-only";

/** Comma-separated admin emails in ADMIN_EMAILS (lowercase match). */
export function parseAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  return parseAdminEmails().has(email.trim().toLowerCase());
}

export function resolveUserRoleForEmail(
  email: string
): "ADMIN" | "REVIEWER" {
  return isAdminEmail(email) ? "ADMIN" : "REVIEWER";
}
