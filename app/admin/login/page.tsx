import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthConfigAlert } from "@/components/auth-config-alert";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { isGoogleSignInConfigured } from "@/lib/auth/env";
import { resolveAdminAccessForUserId } from "@/lib/auth/resolve-admin-access";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const query = await searchParams;
  const nextPath =
    typeof query?.next === "string" && query.next.startsWith("/admin")
      ? query.next
      : "/admin";

  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    const { isAdmin } = await resolveAdminAccessForUserId(userId);
    if (isAdmin) {
      redirect(nextPath);
    }
  }

  const signedIn = Boolean(userId);
  const sessionEmail = session?.user?.email;
  const showNotAuthorized = signedIn || query?.error === "not-admin";

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex text-xs font-bold text-[var(--slop-cream-dim)] hover:text-[var(--slop-cream)]"
        >
          ← Stadium Slop
        </Link>

        <header className="mt-4 border-b border-[var(--slop-line-strong)] pb-4">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            SNG LABS · Admin
          </p>
          <h1 className="mt-1 text-2xl font-black text-[var(--slop-cream)]">
            Admin access
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
            Sign in with Google using an account that has{" "}
            <code className="text-[var(--slop-cream)]">User.role = ADMIN</code> in
            the database.
          </p>
        </header>

        <AuthConfigAlert className="mt-4" />

        {showNotAuthorized ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            {signedIn && sessionEmail ? (
              <>
                <span className="font-bold">Not authorized.</span> Signed in as{" "}
                {sessionEmail}, but this account is not an admin. Run{" "}
                <code className="text-amber-50">
                  npm run make-admin -- your@email.com
                </code>{" "}
                after one contributor sign-in, then reload this page or sign out and
                back in.
              </>
            ) : (
              <>
                <span className="font-bold">Not authorized.</span> Admin access
                requires a signed-in Google account with ADMIN role in the database.
              </>
            )}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3">
          <GoogleSignInButton
            callbackUrl={nextPath}
            label={signedIn ? "Continue with Google" : "Sign in with Google"}
            disabled={!isGoogleSignInConfigured()}
            configErrorRedirect="/admin/login"
          />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[var(--slop-cream-dim)]">
          Bootstrap: sign in at{" "}
          <Link href="/login" className="font-bold text-[var(--slop-gold)] hover:underline">
            /login
          </Link>
          , then{" "}
          <code className="text-[var(--slop-cream-muted)]">
            npm run make-admin -- you@example.com
          </code>
          .
        </p>
      </section>
    </main>
  );
}
