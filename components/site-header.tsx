import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";

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
    <header className="sticky top-0 z-50 border-b border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.92)] text-[var(--slop-cream)] shadow-[var(--slop-shadow-header)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center justify-between gap-2 px-3 py-2.5 sm:px-8 md:gap-4 md:py-3 lg:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Stadium Slop home"
        >
          <span className="hidden md:inline-flex md:items-center">
            <Image
              src="/branding/stadium-slop-wordmark.png"
              alt="Stadium Slop"
              width={560}
              height={112}
              className="h-14 w-auto object-contain"
              priority
            />
          </span>
          <span className="inline-flex items-center md:hidden">
            <Image
              src="/branding/stadium-slop-icon.png"
              alt="Stadium Slop"
              width={256}
              height={256}
              className="h-12 w-auto object-contain"
              priority
            />
          </span>
        </Link>

        <nav className="flex min-w-0 shrink flex-nowrap items-center justify-end gap-1.5 text-xs text-[var(--slop-cream)] md:gap-2 md:text-sm">
          <Link
            href="/"
            className="shrink-0 rounded-full px-2 py-1.5 font-black transition hover:bg-[rgba(244,179,33,0.12)] hover:text-[var(--slop-gold-bright)] md:px-3 md:py-2"
          >
            Home
          </Link>
          <Link
            href="/venues"
            className="shrink-0 whitespace-nowrap rounded-full border border-[var(--slop-gold)]/40 bg-[rgba(244,179,33,0.1)] px-2.5 py-1.5 font-black text-[var(--slop-cream)] transition hover:border-[var(--slop-gold)] hover:bg-[rgba(244,179,33,0.18)] hover:text-[var(--slop-gold-bright)] md:px-3 md:py-2"
          >
            Find a venue
          </Link>
          <Link
            href={accountHref}
            className="shrink-0 whitespace-nowrap rounded-full border border-[var(--slop-line-strong)] bg-[rgba(11,27,43,0.6)] px-2.5 py-1.5 font-black text-[var(--slop-cream)] transition hover:border-[var(--slop-gold)] hover:text-[var(--slop-gold-bright)] md:border-transparent md:bg-[var(--slop-red)] md:px-4 md:py-2 md:shadow-[0_2px_0_rgba(0,0,0,0.25)] md:hover:border-transparent md:hover:bg-[var(--slop-red-deep)] md:hover:text-white"
          >
            {accountLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
