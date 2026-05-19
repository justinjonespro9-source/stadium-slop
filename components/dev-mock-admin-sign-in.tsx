import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  MOCK_ADMIN_COOKIE_NAME,
  MOCK_ADMIN_COOKIE_VALUE,
  MOCK_ADMIN_SESSION_SECONDS,
  allowMockAdminAccess
} from "@/lib/admin-auth";

type DevMockAdminSignInProps = {
  nextPath: string;
};

async function mockAdminSignIn(formData: FormData) {
  "use server";

  if (!allowMockAdminAccess()) {
    return;
  }

  const nextPath = formData.get("next");
  const cookieStore = await cookies();

  cookieStore.set(MOCK_ADMIN_COOKIE_NAME, MOCK_ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    maxAge: MOCK_ADMIN_SESSION_SECONDS,
    path: "/",
    sameSite: "lax"
  });

  redirect(typeof nextPath === "string" && nextPath ? nextPath : "/admin");
}

export function DevMockAdminSignIn({ nextPath }: DevMockAdminSignInProps) {
  if (!allowMockAdminAccess()) {
    return null;
  }

  return (
    <details className="rounded-xl border border-dashed border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.35)] px-3 py-3">
      <summary className="cursor-pointer text-xs font-bold text-[var(--slop-cream-dim)]">
        Development: mock admin cookie
      </summary>
      <form action={mockAdminSignIn} className="mt-3">
        <input type="hidden" name="next" value={nextPath} />
        <button
          type="submit"
          className="brand-cta-secondary w-full rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em]"
        >
          Use dev admin session
        </button>
      </form>
    </details>
  );
}
