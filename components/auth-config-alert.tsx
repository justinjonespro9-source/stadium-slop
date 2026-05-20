import { getAuthEnvIssues, getGoogleOAuthRedirectUri } from "@/lib/auth/env";

type AuthConfigAlertProps = {
  className?: string;
};

/** Shown when Google contributor sign-in cannot run due to missing env. */
export function AuthConfigAlert({ className = "" }: AuthConfigAlertProps) {
  const issues = getAuthEnvIssues();

  if (issues.length === 0) {
    return null;
  }

  const redirectUri = getGoogleOAuthRedirectUri();

  return (
    <div
      role="alert"
      className={`rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100 ${className}`}
    >
      <p className="font-bold">Google sign-in is not configured</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-relaxed text-amber-100/95">
        {issues.map((issue) => (
          <li key={issue.code}>
            {issue.message} {issue.hint}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.65rem] leading-relaxed text-amber-200/90">
        Google Cloud redirect URI for this environment:{" "}
        <code className="break-all text-amber-50">{redirectUri}</code>
      </p>
    </div>
  );
}
