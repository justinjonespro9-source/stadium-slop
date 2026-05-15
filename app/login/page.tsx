import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthPageScaffold, authFieldClass, authLabelClass } from "@/components/auth-ui";
import {
  MOCK_USER_COOKIE_NAME,
  MOCK_USER_COOKIE_VALUE,
  MOCK_USER_SESSION_SECONDS
} from "@/lib/user-auth";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

async function mockUserSignIn(formData: FormData) {
  "use server";

  const nextPath = formData.get("next");
  const cookieStore = await cookies();

  cookieStore.set(MOCK_USER_COOKIE_NAME, MOCK_USER_COOKIE_VALUE, {
    httpOnly: true,
    maxAge: MOCK_USER_SESSION_SECONDS,
    path: "/",
    sameSite: "lax"
  });

  redirect(typeof nextPath === "string" && nextPath ? nextPath : "/account");
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const nextPath = query?.next ?? "/account";

  return (
    <AuthPageScaffold
      eyebrow="Demo session"
      title="Sign in"
      subtitle="Sign in to post reviews, upload photos, and mark helpful."
      footer={
        <p className="text-center text-[0.8rem] text-[var(--slop-cream-muted)]">
          New here?{" "}
          <Link
            href="/signup"
            className="font-black text-[var(--slop-gold)] underline-offset-2 hover:underline"
          >
            Create account
          </Link>
        </p>
      }
    >
      <form action={mockUserSignIn} className="mt-5 grid gap-3">
        <input type="hidden" name="next" value={nextPath} />
        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Email
          <input
            name="email"
            autoComplete="email"
            placeholder="fan@example.com"
            className={authFieldClass}
          />
        </label>
        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Any text (mock)"
            className={authFieldClass}
          />
        </label>
        <button type="submit" className="brand-cta mt-1 w-full rounded-xl px-4 py-3 text-sm font-black">
          Sign in
        </button>
      </form>
    </AuthPageScaffold>
  );
}
