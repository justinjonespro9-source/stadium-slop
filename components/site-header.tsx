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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" aria-label="Stadium Slop home">
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
          <Link
            href={accountHref}
            className="rounded-full border border-[var(--slop-line-strong)] bg-[rgba(11,27,43,0.6)] px-4 py-2 text-sm font-black text-[var(--slop-cream)] transition hover:border-[var(--slop-gold)] hover:text-[var(--slop-gold-bright)] md:hidden"
          >
            {accountLabel}
          </Link>
        </div>

        <nav className="flex items-center gap-2 text-sm text-[var(--slop-cream)]">
          <Link
            href="/"
            className="rounded-full px-3 py-2 font-black transition hover:bg-[rgba(244,179,33,0.12)] hover:text-[var(--slop-gold-bright)]"
          >
            Home
          </Link>
          <Link
            href="/venues"
            className="flex-1 rounded-full border border-[var(--slop-gold)]/40 bg-[rgba(244,179,33,0.1)] px-3 py-2 text-center text-sm font-black text-[var(--slop-cream)] transition hover:border-[var(--slop-gold)] hover:bg-[rgba(244,179,33,0.18)] hover:text-[var(--slop-gold-bright)] md:flex-none md:shrink-0"
          >
            Find a venue
          </Link>
          <Link
            href={accountHref}
            className="hidden rounded-full bg-[var(--slop-red)] px-4 py-2 font-black text-[var(--slop-cream)] shadow-[0_2px_0_rgba(0,0,0,0.25)] transition hover:bg-[var(--slop-red-deep)] hover:text-white md:inline-flex"
          >
            {accountLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
