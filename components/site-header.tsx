import Link from "next/link";
import { cookies } from "next/headers";

import { StadiumSlopWordmark } from "@/components/brand/stadium-slop-wordmark";
import { SiteHeaderNav } from "@/components/site-header-nav";
import { getSessionUser } from "@/lib/auth/require-user";
import {
  MOCK_USER_COOKIE_NAME,
  allowMockUserAccess,
  hasMockUserAccess
} from "@/lib/user-auth";

export async function SiteHeader() {
  const sessionUser = await getSessionUser();
  const cookieStore = await cookies();
  const mockSignedIn =
    allowMockUserAccess() &&
    hasMockUserAccess(cookieStore.get(MOCK_USER_COOKIE_NAME)?.value);
  const isSignedIn = Boolean(sessionUser) || mockSignedIn;
  const accountHref = isSignedIn ? "/account" : "/login";
  const accountLabel = isSignedIn ? "Account" : "Sign in";

  return (
    <header className="media-nav sticky top-0 z-50 backdrop-blur-md">
      <div className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3 lg:px-10">
        <Link
          href="/"
          className="relative z-10 flex min-w-0 shrink items-center transition-opacity hover:opacity-85"
          aria-label="Stadium Slop home"
        >
          <StadiumSlopWordmark />
        </Link>

        <SiteHeaderNav accountHref={accountHref} accountLabel={accountLabel} />
      </div>
    </header>
  );
}
