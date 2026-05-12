import Link from "next/link";

import { BrandLockup } from "./brand-lockup";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/account", label: "Account" },
  { href: "/#trust", label: "Verified Reviews" },
  { href: "/venues", label: "Fan Photos" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "mailto:hello@snglabs.com", label: "Contact" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--slop-line)] bg-[var(--slop-ink)] text-[var(--slop-cream)]">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 md:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div>
          <BrandLockup />
          <p className="mt-4 max-w-xl text-sm leading-6 text-[color:rgba(255,244,223,0.74)]">
            Eats in the Seats. Fan-powered concession intel for finding what is
            worth eating before you hit the line.
          </p>
          <p className="mt-5 text-sm text-[var(--slop-blue)]">
            Fan ratings stay independent. Promoted placements are clearly
            labeled.
          </p>
          <p className="mt-3 max-w-2xl text-xs leading-5 text-[color:rgba(255,244,223,0.46)]">
            Stadium Slop is an independent fan-powered food guide and is not
            affiliated with any stadium, team, league, concessionaire, or vendor
            unless stated.
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-[var(--slop-orange)]">
            © SNG LABS LLC
          </p>
        </div>

        <nav className="flex flex-wrap gap-3 text-sm font-bold text-[var(--slop-cream)] md:justify-end">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-[var(--slop-blue)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
