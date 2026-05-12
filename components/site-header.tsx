import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/venues", label: "Venues" },
  { href: "/venues", label: "Scoreboards" }
];

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-800 bg-[#111111] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <Link href="/" className="text-xl font-black tracking-tight">
          STADIUM SLOP
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-300 sm:gap-6">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link
            href="/venues"
            className="rounded-full bg-white px-4 py-2 font-bold text-black transition hover:bg-zinc-200"
          >
            Submit Food
          </Link>
        </nav>
      </div>
    </header>
  );
}
