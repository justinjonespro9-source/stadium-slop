import { cookies } from "next/headers";

import { authFieldClass, authLabelClass } from "@/components/auth-ui";
import {
  MOCK_USER_COOKIE_NAME,
  MOCK_USER_COOKIE_VALUE,
  MOCK_USER_SESSION_SECONDS,
  allowMockUserAccess
} from "@/lib/user-auth";

type DevMockUserSignInProps = {
  nextPath: string;
};

async function mockUserSignIn(formData: FormData) {
  "use server";

  if (!allowMockUserAccess()) {
    return;
  }

  const nextPath = formData.get("next");
  const cookieStore = await cookies();

  cookieStore.set(MOCK_USER_COOKIE_NAME, MOCK_USER_COOKIE_VALUE, {
    httpOnly: true,
    maxAge: MOCK_USER_SESSION_SECONDS,
    path: "/",
    sameSite: "lax"
  });

  const { redirect } = await import("next/navigation");
  redirect(typeof nextPath === "string" && nextPath ? nextPath : "/account");
}

export async function DevMockUserSignIn({ nextPath }: DevMockUserSignInProps) {
  if (!allowMockUserAccess()) {
    return null;
  }

  return (
    <details className="rounded-xl border border-dashed border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.35)] px-3 py-3">
      <summary className="cursor-pointer text-xs font-bold text-[var(--slop-cream-dim)]">
        Development: mock fan session
      </summary>
      <form action={mockUserSignIn} className="mt-3 grid gap-2">
        <input type="hidden" name="next" value={nextPath} />
        <label className={`grid gap-1 ${authLabelClass}`}>
          <span className="text-[0.65rem] text-[var(--slop-cream-dim)]">
            Skips Google — local testing only
          </span>
          <input
            name="email"
            placeholder="fan@example.com"
            className={authFieldClass}
            readOnly
            defaultValue="demo@stadiumslop.test"
          />
        </label>
        <button
          type="submit"
          className="brand-cta-secondary w-full rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em]"
        >
          Use mock session
        </button>
      </form>
    </details>
  );
}
