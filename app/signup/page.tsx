import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthPageScaffold, authFieldClass, authLabelClass } from "@/components/auth-ui";
import {
  MOCK_USER_COOKIE_NAME,
  MOCK_USER_COOKIE_VALUE,
  MOCK_USER_SESSION_SECONDS
} from "@/lib/user-auth";

type SignupPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

async function mockUserSignUp(formData: FormData) {
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

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const query = await searchParams;
  const nextPath = query?.next ?? "/account";

  return (
    <AuthPageScaffold
      eyebrow="Demo session"
      title="Create your Stadium Slop account."
      footer={
        <p className="text-center text-[0.8rem] text-[var(--slop-cream-muted)]">
          Already have one?{" "}
          <Link
            href="/login"
            className="font-black text-[var(--slop-gold)] underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form action={mockUserSignUp} className="mt-5 grid gap-3">
        <input type="hidden" name="next" value={nextPath} />
        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Display name
          <input
            name="displayName"
            autoComplete="name"
            placeholder="Section 126 Snack Scout"
            className={authFieldClass}
          />
        </label>
        <label className={`grid gap-1.5 ${authLabelClass}`}>
          Handle
          <input
            name="handle"
            autoComplete="username"
            placeholder="@seat126snacks"
            className={authFieldClass}
          />
        </label>
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
            autoComplete="new-password"
            placeholder="Any text (mock)"
            className={authFieldClass}
          />
        </label>
        <button type="submit" className="brand-cta mt-1 w-full rounded-xl px-4 py-3 text-sm font-black">
          Create account
        </button>
      </form>
    </AuthPageScaffold>
  );
}
