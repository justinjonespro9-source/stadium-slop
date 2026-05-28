import Link from "next/link";
import { cookies } from "next/headers";

import { StadiumSlopWordmark } from "@/components/brand/stadium-slop-wordmark";
import { SiteHeaderMobileAccount, SiteHeaderNav } from "@/components/site-header-nav";
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
      <div className="media-nav-bar relative mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-10">
        <SiteHeaderMobileAccount href={accountHref} label={accountLabel} />

        <Link
          href="/"
          className="media-nav-logo flex justify-center transition-opacity hover:opacity-85 md:justify-start"
          aria-label="Stadium Slop home"
        >
          <StadiumSlopWordmark size="header" priority />
        </Link>

        <SiteHeaderNav accountHref={accountHref} accountLabel={accountLabel} />
      </div>
    </header>
  );
}
