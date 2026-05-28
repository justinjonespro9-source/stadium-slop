import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";

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
      <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center justify-between gap-2 px-3 py-2.5 sm:px-6 md:gap-4 md:py-3 lg:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Stadium Slop home"
        >
          <Image
            src="/branding/stadium-slop-icon.png"
            alt=""
            width={256}
            height={256}
            className="h-9 w-9 object-contain sm:h-10 sm:w-10"
            priority
          />
          <span className="hidden font-black tracking-tight text-white sm:inline sm:text-lg">
            Stadium <span className="text-[var(--media-orange-bright)]">Slop</span>
          </span>
        </Link>

        <nav className="flex min-w-0 shrink flex-nowrap items-center justify-end gap-1 sm:gap-1.5">
          <Link href="/" className="media-nav-link media-nav-link--active hidden sm:inline-flex">
            Home
          </Link>
          <Link
            href="/venues"
            className="media-nav-link hidden whitespace-nowrap sm:inline-flex"
          >
            Venues
          </Link>
          <Link
            href={WORLD_CUP_GUIDE_PATH_EN}
            className="media-nav-link hidden whitespace-nowrap min-[480px]:inline-flex"
          >
            <span className="md:hidden">WC Guide</span>
            <span className="hidden md:inline">World Cup</span>
          </Link>
          <Link href="/venues" className="media-nav-cta whitespace-nowrap">
            Leave a review
          </Link>
          <Link
            href={accountHref}
            className="media-nav-link whitespace-nowrap border border-white/12 bg-white/5"
          >
            {accountLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
