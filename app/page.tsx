import Link from "next/link";

import { BrandLockup } from "@/components/brand-lockup";
import {
  HomeFeaturedMlbParks,
  resolveFeaturedMlbParks
} from "@/components/home-featured-mlb-parks";
import { HomeMlbValueStrip } from "@/components/home-mlb-value-strip";
import { HomeVenueSearch } from "@/components/home-venue-search";
import { getPublicVenues } from "@/lib/public-data";

export default async function Home() {
  const venues = await getPublicVenues();
  const featuredMlb = resolveFeaturedMlbParks(venues);

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 lg:px-10">
        <header className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-[1.7rem] border border-[var(--slop-line)] bg-[color:rgba(11,15,20,0.74)] p-3">
            <BrandLockup />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--slop-blue)]">
            MLB-first · fan verified at the park
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[1.08] tracking-tight text-[var(--slop-cream)] sm:text-5xl sm:leading-[1.05]">
            Fan-powered ballpark food rankings
          </h1>
          <p className="mt-4 text-lg font-bold leading-snug text-white sm:text-xl">
            Track the best stadium eats
          </p>
          <HomeMlbValueStrip />
        </header>

        <div className="mt-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Search venues
          </p>
          <HomeVenueSearch venues={venues} />
        </div>

        <div className="mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/venues"
            className="brand-cta inline-flex flex-1 justify-center rounded-full px-6 py-3.5 text-center text-sm font-black transition sm:flex-none sm:px-8"
          >
            Find a venue
          </Link>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full border border-[var(--slop-line)] px-6 py-3.5 text-center text-sm font-black text-[color:rgba(255,244,223,0.45)] sm:px-8"
          >
            Use location soon
          </button>
        </div>

        <HomeFeaturedMlbParks parks={featuredMlb} />

        <section
          aria-label="Game Day Fresh"
          className="mt-10 rounded-2xl border border-[var(--slop-line)] bg-[color:rgba(11,15,20,0.45)] px-4 py-4 sm:px-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slop-orange)]">
                Game Day Fresh
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--slop-cream)]">
                Same-day fan signal — jump straight into fresh-mode standings.
              </p>
            </div>
            {featuredMlb[0] ? (
              <Link
                href={`/venues/${featuredMlb[0].slug}?mode=fresh`}
                className="shrink-0 rounded-full border border-[var(--slop-orange)] bg-[color:rgba(255,106,0,0.12)] px-4 py-2 text-center text-xs font-black uppercase tracking-[0.12em] text-[var(--slop-orange)] transition hover:bg-[color:rgba(255,106,0,0.2)]"
              >
                Try {featuredMlb[0].name}
              </Link>
            ) : (
              <Link
                href="/venues"
                className="shrink-0 rounded-full border border-[var(--slop-orange)] px-4 py-2 text-center text-xs font-black uppercase tracking-[0.12em] text-[var(--slop-orange)]"
              >
                Browse venues
              </Link>
            )}
          </div>
        </section>

        <section
          id="trust"
          className="brand-panel mt-10 max-w-3xl rounded-2xl border p-4 sm:rounded-3xl sm:p-5"
        >
          <p className="text-sm leading-relaxed text-[color:rgba(255,244,223,0.72)]">
            Independent guide — names for identification only. Promotions can buy
            visibility, not ratings. Photos and scores come from real fans at the
            ballpark.
          </p>
        </section>
      </section>
    </main>
  );
}
