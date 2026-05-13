import Link from "next/link";

import { BrandLockup } from "./brand-lockup";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--slop-line)] bg-[var(--slop-ink)] text-[var(--slop-cream)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Stadium Slop home">
            <BrandLockup compact />
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[var(--slop-line)] px-4 py-2 text-sm font-black text-[var(--slop-cream)] md:hidden"
          >
            Sign in
          </Link>
        </div>

        <nav className="flex items-center gap-2 text-sm text-[var(--slop-cream)]">
          <Link href="/" className="font-black hover:text-[var(--slop-blue)]">
            Home
          </Link>
          <Link
            href="/venues"
            className="flex-1 rounded-full border border-[var(--slop-line)] bg-[var(--slop-navy)] px-4 py-2 font-bold text-[var(--slop-blue)] transition hover:border-[var(--slop-blue)] md:min-w-56"
          >
            Find a venue...
          </Link>
          <Link
            href="/account"
            className="hidden rounded-full bg-[var(--slop-red)] px-4 py-2 font-black text-[var(--slop-cream)] transition hover:bg-[var(--slop-orange)] hover:text-[var(--slop-ink)] md:inline-flex"
          >
            Account / Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
