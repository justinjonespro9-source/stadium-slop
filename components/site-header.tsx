import Link from "next/link";
import { cookies } from "next/headers";

import { StadiumSlopWordmark } from "@/components/brand/stadium-slop-wordmark";
import { getSessionUser } from "@/lib/auth/require-user";
import { WORLD_CUP_GUIDE_PATH_EN } from "@/lib/world-cup-stadium-food-guide-content";
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
      <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center justify-between gap-2 px-3 py-2.5 sm:px-6 md:gap-3 md:py-3 lg:px-10">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2.5 sm:gap-3"
          aria-label="Stadium Slop home"
        >
          <StadiumSlopWordmark className="hidden min-[400px]:flex" />
          <StadiumSlopWordmark className="min-[400px]:hidden" compact />
        </Link>

        <nav className="flex min-w-0 shrink flex-nowrap items-center justify-end gap-1 sm:gap-1.5">
          <Link href="/" className="media-nav-link media-nav-link--active hidden md:inline-flex">
            Home
          </Link>
          <Link href="/venues" className="media-nav-link hidden whitespace-nowrap lg:inline-flex">
            Venues
          </Link>
          <Link
            href={WORLD_CUP_GUIDE_PATH_EN}
            className="media-nav-link hidden whitespace-nowrap min-[520px]:inline-flex"
          >
            <span className="lg:hidden">WC</span>
            <span className="hidden lg:inline">World Cup</span>
          </Link>
          <Link href="/venues" className="media-primary-button whitespace-nowrap text-[0.7rem] sm:text-[0.8125rem]">
            <span className="hidden min-[380px]:inline">Leave a </span>Review
          </Link>
          <Link
            href={accountHref}
            className="media-nav-link whitespace-nowrap border border-white/12 bg-white/5 px-2 py-1.5 text-[0.7rem] sm:px-2.5 sm:text-[0.8125rem]"
          >
            {accountLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
