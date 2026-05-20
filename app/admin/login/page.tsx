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
    hint?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const query = await searchParams;
  const nextPath =
    typeof query?.next === "string" && query.next.startsWith("/admin")
      ? query.next
      : "/admin";
  const error = query?.error;
  const staleSessionHint = query?.hint === "stale-session";

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
            the database. Fan sign-in alone does not grant admin access.
          </p>
        </header>

        <AuthConfigAlert className="mt-4" />

        {signedIn && sessionEmail ? (
          <p className="mt-4 rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-3 py-2.5 text-xs text-[var(--slop-cream-muted)]">
            Signed in as <span className="font-bold text-[var(--slop-cream)]">{sessionEmail}</span>
            . Use the same Google account here after promotion, or sign out from{" "}
            <Link href="/account" className="font-bold text-[var(--slop-gold)] hover:underline">
              your account
            </Link>{" "}
            and sign in again so admin access refreshes.
          </p>
        ) : null}

        {error === "not-admin" ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            {signedIn
              ? "This Google account is signed in but is not an admin in the database."
              : "Admin access requires a signed-in Google account with ADMIN role."}
            {signedIn ? (
              <>
                {" "}
                After{" "}
                <code className="text-amber-50">npm run make-admin -- your@email.com</code>
                , sign out and sign in again (or open this page while signed in — we
                check the live database role).
              </>
            ) : (
              <>
                {" "}
                Sign in once at{" "}
                <Link href="/login" className="font-bold underline">
                  /login
                </Link>
                , run make-admin, then return here.
              </>
            )}
          </p>
        ) : null}

        {staleSessionHint ? (
          <p className="mt-3 text-xs leading-relaxed text-amber-100/90">
            Your session cookie still had an old role claim. This page now checks
            the database directly — try{" "}
            <Link href={nextPath} className="font-bold underline">
              opening admin again
            </Link>{" "}
            or sign out and back in once.
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
          . New users in{" "}
          <code className="text-[var(--slop-cream-muted)]">ADMIN_EMAILS</code> get
          ADMIN on first sign-up only.
        </p>
      </section>
    </main>
  );
}
