import Link from "next/link";

import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { DevMockAdminSignIn } from "@/components/dev-mock-admin-sign-in";

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
  const error = query?.error;

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
            Sign in with an allowlisted Google account. Fan contributor sign-in does
            not grant admin access.
          </p>
        </header>

        {error === "not-admin" ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-amber-800/80 bg-amber-950/50 px-3 py-2.5 text-sm text-amber-100"
          >
            That Google account is not on the admin allowlist.
          </p>
        ) : null}

        <div className="mt-5 grid gap-3">
          <GoogleSignInButton
            callbackUrl={nextPath}
            label="Sign in with Google"
          />
          <DevMockAdminSignIn nextPath={nextPath} />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[var(--slop-cream-dim)]">
          Admin emails are configured with{" "}
          <code className="text-[var(--slop-cream-muted)]">ADMIN_EMAILS</code> on
          the server.
        </p>
      </section>
    </main>
  );
}
