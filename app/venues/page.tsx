import Link from "next/link";

import { foodItems, venues } from "@/lib/sample-data";

const topFoodItemByVenueSlug = foodItems.reduce<
  Record<string, (typeof foodItems)[number]>
>((topItems, item) => {
  const currentTopItem = topItems[item.venueSlug];

  if (!currentTopItem || item.slopScore > currentTopItem.slopScore) {
    topItems[item.venueSlug] = item;
  }

  return topItems;
}, {});

export default function VenuesPage() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
        <header className="py-12">
          <p className="mb-4 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300">
            Browse Venues
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Start with the venues in the Stadium Slop sample set.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            This MVP keeps the venue list intentionally small while the routing,
            layout, and food ranking flows take shape.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {venues.map((venue) => {
            const venueFoodItems = foodItems.filter(
              (item) => item.venueSlug === venue.slug
            );
            const topItem = topFoodItemByVenueSlug[venue.slug];

            return (
              <Link
                key={venue.slug}
                href={`/venues/${venue.slug}`}
                className="group rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-500"
              >
                <article>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black">{venue.name}</h2>
                      <p className="mt-2 text-sm text-zinc-400">
                        {venue.city}, {venue.state}
                      </p>
                    </div>
                    <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
                      {venue.venueType}
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-zinc-500">
                    {venue.teams.join(", ")}
                  </p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                    {venue.leagues.join(", ")}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {venue.sports.join(", ")}
                  </p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">
                    {venue.reviewRadiusMeters}m verified review zone
                  </p>

                  <div className="mt-6 rounded-2xl bg-black p-4">
                    <p className="text-sm text-zinc-500">
                      {venueFoodItems.length} food{" "}
                      {venueFoodItems.length === 1 ? "item" : "items"}
                    </p>
                    <p className="mt-3 text-sm text-zinc-500">Top item</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="font-bold">
                        {topItem ? topItem.name : "No food items yet"}
                      </p>
                      {topItem?.isPromoted ? (
                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                          Promoted
                        </span>
                      ) : null}
                      {topItem?.isNewThisSeason ? (
                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                          New This Season
                        </span>
                      ) : null}
                    </div>
                    {topItem ? (
                      <p className="mt-1 text-sm text-zinc-500">
                        Slop Score {topItem.slopScore.toFixed(1)} ·{" "}
                        {topItem.verdict}
                      </p>
                    ) : null}
                  </div>

                  <p className="mt-5 text-sm font-bold text-zinc-300 transition group-hover:text-white">
                    View venue
                  </p>
                </article>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
