import Link from "next/link";

import { BrandLockup } from "@/components/brand-lockup";
import { HomeVenueSearch } from "@/components/home-venue-search";
import { getPublicVenues } from "@/lib/public-data";

export default async function Home() {
  const venues = await getPublicVenues();
  const popularSearches = venues.slice(0, 3);

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-3xl flex-col justify-center px-5 py-12 sm:px-8">
        <header>
          <div className="mb-6 inline-flex rounded-[1.7rem] border border-[var(--slop-line)] bg-[color:rgba(11,15,20,0.74)] p-3">
            <BrandLockup />
          </div>
          <p className="mt-6 text-2xl font-black leading-tight tracking-tight sm:text-4xl">
            Find your venue. Then find what&apos;s worth eating.
          </p>
          <p className="mt-5 text-base leading-7 text-[color:rgba(255,244,223,0.78)] sm:text-lg">
            MLB ballparks first — then the rest of the league. Search by park,
            city, team, or food. Browse is public. Verified game-day reviews need
            a free profile and an on-site check.
          </p>
        </header>

        <HomeVenueSearch venues={venues} />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/venues"
            className="brand-cta rounded-full px-6 py-4 text-center text-sm font-black transition"
          >
            Find a venue
          </Link>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full border border-[var(--slop-line)] px-6 py-4 text-center text-sm font-black text-[color:rgba(255,244,223,0.45)]"
          >
            Use location soon
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slop-blue)]">
            Browse nearby venues
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {popularSearches.map((venue) => (
              <Link
                key={venue.slug}
                href={`/venues/${venue.slug}`}
                className="brand-pill rounded-full border px-4 py-2 text-sm font-bold transition hover:border-[var(--slop-blue)] hover:text-[var(--slop-blue)]"
              >
                {venue.name}
              </Link>
            ))}
          </div>
        </div>

        <section
          id="trust"
          className="brand-panel mt-10 rounded-3xl border p-5"
        >
          <div className="space-y-3 text-sm leading-6 text-[color:rgba(255,244,223,0.7)]">
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
