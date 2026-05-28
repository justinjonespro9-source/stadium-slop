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
  active
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`media-nav-link whitespace-nowrap ${active ? "media-nav-link--active bg-white/10" : ""}`}
    >
      {children}
    </Link>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
    </svg>
  );
}

function AccountPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="media-nav-account inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/14 bg-white/8 px-2.5 py-1.5 text-[0.7rem] font-bold text-white/90 transition hover:border-white/25 hover:bg-white/12 sm:px-3 sm:text-[0.8125rem]"
    >
      <span className="min-[400px]:hidden">
        <AccountIcon />
        <span className="sr-only">{label}</span>
      </span>
      <span className="hidden min-[400px]:inline">{label}</span>
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
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isHome = pathname === "/";
  const isVenues = pathname === "/venues" || pathname.startsWith("/venues/");
  const isWorldCup = pathname.startsWith("/world-cup") || pathname.includes("guia-comida");

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

      <div className="relative z-10 ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <AccountPill href={accountHref} label={accountLabel} />
        <button
          type="button"
          className="media-nav-menu-btn inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/14 bg-white/8 text-white md:hidden"
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
        <div
          id="site-mobile-nav"
          className="w-full basis-full border-t border-white/10 bg-[#080d14] px-3 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            <NavLink href="/" active={isHome}>
              Home
            </NavLink>
            <NavLink href="/venues" active={isVenues && !isWorldCup}>
              Venues
            </NavLink>
            <NavLink href={WORLD_CUP_GUIDE_PATH_EN} active={isWorldCup}>
              World Cup Food Guide
            </NavLink>
          </div>
        </div>
      ) : null}
    </>
  );
}
