import Link from "next/link";

import { BrandLockup } from "./brand-lockup";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/account", label: "Account" },
  { href: "/venues", label: "Verified Reviews" },
  { href: "/venues", label: "Fan Photos" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "mailto:hello@snglabs.com", label: "Contact" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--slop-line-strong)] bg-[var(--slop-navy-deep)] text-[var(--slop-cream)]">
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:gap-6 sm:px-8 sm:py-8 md:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div>
          <BrandLockup />
          <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--slop-cream-muted)]">
            Eats in the Seats. Fan-powered concession intel for finding what is
            worth eating before you hit the line.
          </p>
          <p className="mt-5 text-sm font-bold text-[var(--slop-gold-dim)]">
            Fan ratings stay independent. Promoted placements are clearly
            labeled.
          </p>
          <p className="mt-3 max-w-2xl text-xs leading-5 text-[var(--slop-cream-dim)]">
            Fan-powered and independently maintained. Reviews are crowd opinions,
            not venue or team endorsements. Menus and stands can change anytime.
          </p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.15em] text-[var(--slop-gold)]">
            © SNG LABS LLC
          </p>
        </div>

        <nav className="flex flex-wrap gap-3 text-sm font-bold text-[var(--slop-cream)] md:justify-end">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full px-2 py-1 transition hover:text-[var(--slop-gold-bright)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
