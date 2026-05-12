import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-800 bg-[#111111] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black tracking-tight">
            STADIUM SLOP
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-300 md:hidden"
          >
            Sign in
          </Link>
        </div>

        <nav className="flex items-center gap-3 text-sm text-zinc-300">
          <Link href="/" className="font-bold hover:text-white">
            Home
          </Link>
          <Link
            href="/venues"
            className="flex-1 rounded-full border border-zinc-800 bg-black px-4 py-2 text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-300 md:min-w-56"
          >
            Find a venue...
          </Link>
          <Link
            href="/account"
            className="hidden rounded-full border border-zinc-700 px-4 py-2 font-bold text-zinc-300 transition hover:border-zinc-400 hover:text-white md:inline-flex"
          >
            Account / Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
