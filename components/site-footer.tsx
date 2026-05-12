import Link from "next/link";

const footerLinks = [
  { href: "/venues", label: "Venues" },
  { href: "/venues", label: "Scoreboards" },
  { href: "/#trust", label: "Verified Reviews" },
  { href: "/venues", label: "Fan Photos" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-[#111111] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 sm:px-8 md:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div>
          <p className="text-xl font-black tracking-tight">STADIUM SLOP</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            Fan-powered concession intel for finding what is worth eating before
            you hit the line.
          </p>
          <p className="mt-5 text-sm text-zinc-500">
            Fan ratings stay independent. Promoted placements are clearly
            labeled.
          </p>
        </div>

        <nav className="flex flex-wrap gap-4 text-sm font-bold text-zinc-300 md:justify-end">
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
