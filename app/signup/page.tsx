import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BrandLockup } from "@/components/brand-lockup";
import {
  MOCK_USER_COOKIE_NAME,
  MOCK_USER_COOKIE_VALUE,
  MOCK_USER_SESSION_SECONDS
} from "@/lib/user-auth";

async function mockUserSignUp() {
  "use server";

  const cookieStore = await cookies();

  cookieStore.set(MOCK_USER_COOKIE_NAME, MOCK_USER_COOKIE_VALUE, {
    httpOnly: true,
    maxAge: MOCK_USER_SESSION_SECONDS,
    path: "/",
    sameSite: "lax"
  });

  redirect("/account");
}

export default function SignupPage() {
  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-xl flex-col justify-center px-5 py-10 sm:px-8">
        <div className="brand-panel rounded-[2rem] border p-5 sm:p-7">
          <BrandLockup />

          <p className="brand-pill mt-6 inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            Temporary mock auth
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Create your reviewer profile
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            A profile will eventually own your Slop Scores, fan photos, helpful
            likes received, and verified game-day reviews. No database or real
            password security is connected yet.
          </p>

          <form action={mockUserSignUp} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Display name
              <input
                name="displayName"
                placeholder="Section 126 Snack Scout"
                className="rounded-2xl border border-[var(--slop-line)] bg-[var(--slop-ink)] px-4 py-4 text-sm text-[var(--slop-cream)] outline-none placeholder:text-zinc-600"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Handle
              <input
                name="handle"
                placeholder="@seat126snacks"
                className="rounded-2xl border border-[var(--slop-line)] bg-[var(--slop-ink)] px-4 py-4 text-sm text-[var(--slop-cream)] outline-none placeholder:text-zinc-600"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Email
              <input
                name="email"
                placeholder="fan@example.com"
                className="rounded-2xl border border-[var(--slop-line)] bg-[var(--slop-ink)] px-4 py-4 text-sm text-[var(--slop-cream)] outline-none placeholder:text-zinc-600"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-300">
              Password
              <input
                name="password"
                type="password"
                placeholder="Mock password"
                className="rounded-2xl border border-[var(--slop-line)] bg-[var(--slop-ink)] px-4 py-4 text-sm text-[var(--slop-cream)] outline-none placeholder:text-zinc-600"
              />
            </label>
            <button
              type="submit"
              className="brand-cta rounded-full px-6 py-4 text-sm font-black transition"
            >
              Create mock profile
            </button>
          </form>

          <p className="mt-4 text-sm text-zinc-400">
            Already have a profile?{" "}
            <Link href="/login" className="font-black text-[var(--slop-blue)]">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
