import Link from "next/link";

import { venues } from "@/lib/sample-data";

const popularSearches = venues.slice(0, 3);

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-3xl flex-col justify-center px-5 py-12 sm:px-8">
        <header>
          <p className="mb-5 inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            Eats in the Seats
          </p>
          <h1 className="text-5xl font-black leading-none tracking-tight sm:text-7xl">
            STADIUM SLOP
          </h1>
          <p className="mt-6 text-2xl font-black leading-tight tracking-tight sm:text-4xl">
            Find what&apos;s worth eating before you hit the concession line.
          </p>
          <p className="mt-5 text-base leading-7 text-zinc-300 sm:text-lg">
            Search stadiums, arenas, ballparks, teams, or cities. Browse is
            public. Verified reviews require a free profile and an on-site
            location check.
          </p>
        </header>

        <div className="mt-10 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
          <input
            aria-label="Search Stadium Slop"
            readOnly
            placeholder="Search for a venue, team, city, or stadium..."
            className="w-full rounded-[1.5rem] bg-black px-5 py-5 text-base font-semibold text-white outline-none placeholder:text-zinc-500 sm:text-lg"
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/venues"
            className="rounded-full bg-white px-6 py-4 text-center text-sm font-black text-black transition hover:bg-zinc-200"
          >
            Find My Venue
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-zinc-700 px-6 py-4 text-center text-sm font-black text-zinc-200 transition hover:border-zinc-400 hover:text-white"
          >
            Sign in to leave reviews
          </Link>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
            Popular searches
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {popularSearches.map((venue) => (
              <Link
                key={venue.slug}
                href={`/venues/${venue.slug}`}
                className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                {venue.name}
              </Link>
            ))}
          </div>
        </div>

        <section id="trust" className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="space-y-3 text-sm leading-6 text-zinc-400">
            <p>Independent fan-powered concessions guide.</p>
            <p>
              Venue, team, vendor, and item names are used for identification
              only.
            </p>
            <p>Promoted placements can buy visibility, not ratings.</p>
          </div>
        </section>
      </section>
    </main>
  );
}
