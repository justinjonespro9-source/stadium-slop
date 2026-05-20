import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthConfigAlert } from "@/components/auth-config-alert";
import { AuthPageScaffold } from "@/components/auth-ui";
import { DevMockUserSignIn } from "@/components/dev-mock-user-sign-in";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { isGoogleSignInConfigured } from "@/lib/auth/env";
import { resolveAdminAccessForUserId } from "@/lib/auth/resolve-admin-access";
import { getSessionUser } from "@/lib/auth/require-user";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const nextPath =
    typeof query?.next === "string" && query.next.startsWith("/")
      ? query.next
      : "/account";

  const user = await getSessionUser();
  if (user) {
    if (nextPath.startsWith("/admin")) {
      const { isAdmin } = await resolveAdminAccessForUserId(user.id);
      if (!isAdmin) {
        redirect("/account?error=not-admin");
      }
    }
    redirect(nextPath);
  }

  const authReady = isGoogleSignInConfigured();
  const configError = query?.error === "auth-config";

  return (
    <AuthPageScaffold
      eyebrow="Contributor account"
      title="Sign in"
      subtitle="Use Google to post reviews, upload photos, and report prices. Browsing stays free without an account."
      footer={
        <p className="text-center text-[0.75rem] leading-relaxed text-[var(--slop-cream-dim)]">
          {/* TODO: optional email magic link sign-in */}
          By signing in you agree to our{" "}
          <Link href="/terms" className="font-bold text-[var(--slop-gold)] hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-bold text-[var(--slop-gold)] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      }
    >
      <AuthConfigAlert className="mt-4" />
      {configError && authReady ? (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2 text-xs text-amber-100"
        >
          Sign-in could not start. Check .env and that your browser URL matches{" "}
          <code className="text-amber-50">AUTH_URL</code>.
        </p>
      ) : null}
      <div className="mt-5 grid gap-3">
        <GoogleSignInButton callbackUrl={nextPath} disabled={!authReady} />
        <DevMockUserSignIn nextPath={nextPath} />
      </div>
    </AuthPageScaffold>
  );
}
