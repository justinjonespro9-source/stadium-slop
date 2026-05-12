import Link from "next/link";

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
    <footer className="border-t border-zinc-800 bg-[#111111] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 md:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div>
          <p className="text-xl font-black tracking-tight">STADIUM SLOP</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            Eats in the Seats. Fan-powered concession intel for finding what is
            worth eating before you hit the line.
          </p>
          <p className="mt-5 text-sm text-zinc-500">
            Fan ratings stay independent. Promoted placements are clearly
            labeled.
          </p>
          <p className="mt-3 max-w-2xl text-xs leading-5 text-zinc-600">
            Stadium Slop is an independent fan-powered food guide and is not
            affiliated with any stadium, team, league, concessionaire, or vendor
            unless stated.
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">
            © SNG LABS LLC
          </p>
        </div>

        <nav className="flex flex-wrap gap-3 text-sm font-bold text-zinc-300 md:justify-end">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
