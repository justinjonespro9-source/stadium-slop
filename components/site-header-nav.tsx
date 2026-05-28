"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { WORLD_CUP_GUIDE_PATH_EN } from "@/lib/world-cup-stadium-food-guide-content";

type SiteHeaderNavProps = {
  accountHref: string;
  accountLabel: string;
};

function NavLink({
  href,
  children,
  active,
  className = ""
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`media-nav-link whitespace-nowrap ${active ? "media-nav-link--active bg-white/10" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  active,
  description
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  description?: string;
}) {
  return (
    <Link
      href={href}
      className={`media-nav-mobile-link ${active ? "media-nav-mobile-link--active" : ""}`}
    >
      <span className="media-nav-mobile-link__label">{children}</span>
      {description ? (
        <span className="media-nav-mobile-link__desc">{description}</span>
      ) : null}
    </Link>
  );
}

export function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
    </svg>
  );
}

/** Mobile header left — account icon only */
export function SiteHeaderMobileAccount({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="media-nav-account-icon flex h-11 w-11 max-h-11 max-w-11 items-center justify-center rounded-full border border-white/14 bg-white/8 text-white/90 transition hover:border-white/25 hover:bg-white/12 md:hidden"
    >
      <AccountIcon />
      <span className="sr-only">{label}</span>
    </Link>
  );
}

function AccountPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="media-nav-account hidden items-center justify-center rounded-full border border-white/14 bg-white/8 px-3 py-1.5 text-[0.8125rem] font-bold text-white/90 transition hover:border-white/25 hover:bg-white/12 md:inline-flex"
    >
      {label}
    </Link>
  );
}

export function SiteHeaderNav({ accountHref, accountLabel }: SiteHeaderNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isHome = pathname === "/";
  const isVenues = pathname === "/venues" || pathname.startsWith("/venues/");
  const isWorldCup = pathname.startsWith("/world-cup") || pathname.includes("guia-comida");
  const isAccount = pathname === "/account" || pathname === "/login";

  return (
    <>
      <nav
        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 md:flex lg:gap-1"
        aria-label="Main"
      >
        <NavLink href="/" active={isHome}>
          Home
        </NavLink>
        <NavLink href="/venues" active={isVenues && !isWorldCup}>
          Venues
        </NavLink>
        <NavLink href={WORLD_CUP_GUIDE_PATH_EN} active={isWorldCup}>
          World Cup
        </NavLink>
      </nav>

      <div className="media-nav-actions relative z-10 flex items-center justify-end gap-2 md:ml-auto">
        <AccountPill href={accountHref} label={accountLabel} />
        <button
          type="button"
          className="media-nav-menu-btn inline-flex h-11 w-11 max-h-11 max-w-11 items-center justify-center rounded-full border border-white/14 bg-white/8 text-white md:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
              <rect x="4" y="6" width="16" height="2" rx="1" />
              <rect x="4" y="11" width="16" height="2" rx="1" />
              <rect x="4" y="16" width="16" height="2" rx="1" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/55 md:hidden"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="site-mobile-nav"
            className="media-nav-mobile-panel fixed inset-x-0 top-[var(--media-nav-height)] z-50 max-h-[calc(100dvh-var(--media-nav-height))] overflow-y-auto border-t border-white/10 bg-[#080d14] px-3 py-3 shadow-[0_24px_48px_rgba(0,0,0,0.55)] md:hidden"
          >
            <nav className="flex flex-col gap-1.5" aria-label="Mobile">
              <MobileNavLink href="/" active={isHome}>
                Home
              </MobileNavLink>
              <MobileNavLink
                href="/venues"
                active={isVenues && !isWorldCup}
                description="Search stadiums and menus"
              >
                Venues / Find a venue
              </MobileNavLink>
              <MobileNavLink href={WORLD_CUP_GUIDE_PATH_EN} active={isWorldCup}>
                World Cup
              </MobileNavLink>
              <MobileNavLink href={accountHref} active={isAccount}>
                {accountLabel}
              </MobileNavLink>
            </nav>
          </div>
        </>
      ) : null}
    </>
  );
}
