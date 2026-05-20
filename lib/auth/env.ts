import "server-only";

export type AuthEnvIssue = {
  /** Stable code for UI/query strings (no secrets). */
  code: string;
  message: string;
  hint: string;
};

export function getAuthSecret(): string | undefined {
  const value = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  return value?.trim() || undefined;
}

/** Canonical app origin for Auth.js (must match the browser URL you use locally). */
export function getAuthBaseUrl(): string | undefined {
  const value =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL;
  return value?.trim().replace(/\/$/, "") || undefined;
}

export function getGoogleClientId(): string | undefined {
  const value = process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID;
  return value?.trim() || undefined;
}

export function getGoogleClientSecret(): string | undefined {
  const value =
    process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET;
  return value?.trim() || undefined;
}

export function getGoogleOAuthRedirectUri(baseUrl?: string): string {
  const base = baseUrl ?? getAuthBaseUrl() ?? "http://127.0.0.1:3000";
  return `${base.replace(/\/$/, "")}/api/auth/callback/google`;
}

export function getAuthEnvIssues(): AuthEnvIssue[] {
  const issues: AuthEnvIssue[] = [];

  if (!getAuthSecret()) {
    issues.push({
      code: "missing-auth-secret",
      message: "AUTH_SECRET is not set.",
      hint: "Add AUTH_SECRET to .env (generate with: openssl rand -base64 32). NEXTAUTH_SECRET is also accepted."
    });
  }

  if (!getAuthBaseUrl()) {
    issues.push({
      code: "missing-auth-url",
      message: "AUTH_URL (or NEXTAUTH_URL) is not set.",
      hint:
        "Set AUTH_URL to your dev origin, e.g. http://127.0.0.1:3000 — it must match the host in your browser and Google OAuth redirect URIs."
    });
  }

  if (!getGoogleClientId()) {
    issues.push({
      code: "missing-google-client-id",
      message: "GOOGLE_CLIENT_ID is not set.",
      hint: "Create an OAuth 2.0 Web client in Google Cloud Console and paste the client ID into .env."
    });
  }

  if (!getGoogleClientSecret()) {
    issues.push({
      code: "missing-google-client-secret",
      message: "GOOGLE_CLIENT_SECRET is not set.",
      hint: "Paste the Google OAuth client secret into .env (server-only; never commit)."
    });
  }

  return issues;
}

export function isGoogleSignInConfigured(): boolean {
  return getAuthEnvIssues().length === 0;
}
