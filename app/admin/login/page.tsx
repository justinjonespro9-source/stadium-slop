import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BrandLockup } from "@/components/brand-lockup";
import {
  MOCK_ADMIN_COOKIE_NAME,
  MOCK_ADMIN_COOKIE_VALUE,
  MOCK_ADMIN_SESSION_SECONDS
} from "@/lib/admin-auth";

async function mockAdminSignIn() {
  "use server";

  const cookieStore = await cookies();

  cookieStore.set(MOCK_ADMIN_COOKIE_NAME, MOCK_ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    maxAge: MOCK_ADMIN_SESSION_SECONDS,
    path: "/",
    sameSite: "lax"
  });

  redirect("/admin");
}

export default function AdminLoginPage() {
  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-xl flex-col justify-center px-5 py-10 sm:px-8">
        <div className="brand-panel rounded-[2rem] border p-5 sm:p-7">
          <BrandLockup />

          <p className="brand-pill mt-6 inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            Temporary dev-only gate
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Admin Access
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Future SNG LABS admin console for Stadium Slop operations,
            moderation, reports, and venue data. This mock login only sets a
            local development cookie. No real auth provider or database is wired
            up yet.
          </p>

          <form action={mockAdminSignIn} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Admin email
              <input
                name="email"
                placeholder="admin@snglabs.com"
                className="rounded-2xl border border-[var(--slop-line)] bg-[var(--slop-ink)] px-4 py-4 text-sm text-[var(--slop-cream)] outline-none placeholder:text-zinc-600"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Password
              <input
                name="password"
                type="password"
                placeholder="Dev password placeholder"
                className="rounded-2xl border border-[var(--slop-line)] bg-[var(--slop-ink)] px-4 py-4 text-sm text-[var(--slop-cream)] outline-none placeholder:text-zinc-600"
              />
            </label>

            <button
              type="submit"
              className="brand-cta rounded-full px-6 py-4 text-sm font-black transition"
            >
              Sign in to admin
            </button>
          </form>

          <p className="mt-4 text-xs leading-5 text-zinc-500">
            Placeholder fields are not validated. Replace this with real SNG
            LABS authentication before production use.
          </p>
        </div>
      </section>
    </main>
  );
}
