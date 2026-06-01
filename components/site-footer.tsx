import Link from "next/link";

import { BrandLockup } from "./brand-lockup";
import {
  PROMOTED_PLACEMENT_NOTE,
  PUBLIC_TRUST_STATEMENT,
  SITE_SOCIAL_LINKS
} from "@/lib/site-contact";
import {
  WORLD_CUP_GUIDE_PATH_EN,
  WORLD_CUP_GUIDE_PATH_ES
} from "@/lib/world-cup-stadium-food-guide-content";

const guideLinks = [
  { href: WORLD_CUP_GUIDE_PATH_EN, label: "World Cup Food Guide" },
  { href: WORLD_CUP_GUIDE_PATH_ES, label: "Guía Mundial 2026" },
  { href: "/state-fair-food-guide", label: "State Fair Slop" }
] as const;

const legalLinks = [
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/claim", label: "Partner / claim listing" }
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--slop-line-strong)] bg-[var(--slop-navy-deep)] text-[var(--slop-cream)]">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:gap-8 sm:px-8 sm:py-8 md:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <div>
          <BrandLockup />
          <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--slop-cream-muted)]">
            Eats in the Seats. Fan-powered concession intel for finding what is
            worth eating before you hit the line.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--slop-cream-muted)]">
            {PUBLIC_TRUST_STATEMENT}
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[var(--slop-cream-dim)]">
            {PROMOTED_PLACEMENT_NOTE}
          </p>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.15em] text-[var(--slop-gold)]">
            © SNG LABS LLC
          </p>
        </div>

        <div className="flex flex-col gap-5 md:items-end md:text-right">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
              Connect
            </p>
            <nav
              className="mt-2 flex flex-wrap gap-2 md:justify-end"
              aria-label="Social and contact"
            >
              {SITE_SOCIAL_LINKS.map((link) => {
                const external = link.href.startsWith("http");
                const className =
                  "rounded-full border border-[var(--slop-line-strong)] px-3 py-1.5 text-xs font-bold text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)]/45 hover:text-[var(--slop-gold-bright)]";

                if (external) {
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                      {...(link.isPlaceholder
                        ? { "aria-label": `${link.label} (coming soon)` }
                        : {})}
                    >
                      {link.label}
                    </a>
                  );
                }

                return (
                  <a key={link.id} href={link.href} className={className}>
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
              Guides
            </p>
            <nav
              className="mt-2 flex flex-wrap gap-2 md:justify-end"
              aria-label="Guides"
            >
              {guideLinks.map((link) => (
                <Link key={link.href} href={link.href} className={classNameForLegalLink}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
              Legal &amp; business
            </p>
            <nav
              className="mt-2 flex flex-wrap gap-2 md:justify-end"
              aria-label="Legal and business"
            >
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className={classNameForLegalLink}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

const classNameForLegalLink =
  "rounded-full px-2 py-1 text-xs font-bold text-[var(--slop-cream-muted)] transition hover:text-[var(--slop-gold-bright)]";
