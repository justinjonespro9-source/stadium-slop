import Link from "next/link";

import { foodItems, venues } from "@/lib/sample-data";

type FoodItem = (typeof foodItems)[number];

const quickActionChips = [
  "NFL",
  "MLB",
  "NBA",
  "NHL",
  "MLS",
  "WNBA",
  "NWSL",
  "PWHL",
  "College",
  "EPL"
];

const topSlopScores = [...foodItems].sort((a, b) => b.slopScore - a.slopScore);
const newThisSeasonItems = foodItems.filter((item) => item.isNewThisSeason);
const napkinNightmares = [...foodItems].sort(
  (a, b) => b.napkinRating - a.napkinRating
);
const slopAlerts = foodItems.filter((item) => item.verdict === "Slop Alert");

const discoveryRows = [
  {
    title: "Top Slop Scores",
    description: "The highest-rated bites in the sample dataset.",
    items: topSlopScores
  },
  {
    title: "New This Season",
    description: "Fresh concession reports fans should know about.",
    items: newThisSeasonItems
  },
  {
    title: "Napkin Nightmares",
    description: "Messy favorites and jersey-risk decisions.",
    items: napkinNightmares
  },
  {
    title: "Slop Alerts",
    description: "Low-signal items fans may want to skip.",
    items: slopAlerts
  }
];

function getVenueForFoodItem(item: FoodItem) {
  return venues.find((venue) => venue.slug === item.venueSlug);
}

function FoodDiscoveryCard({ item }: { item: FoodItem }) {
  const venue = getVenueForFoodItem(item);

  return (
    <Link
      href={`/venues/${item.venueSlug}/${item.slug}`}
      className="group flex min-h-full flex-col rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-500"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            {item.category}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black">{item.name}</h3>
            {item.isPromoted ? (
              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                Promoted
              </span>
            ) : null}
            {item.isNewThisSeason ? (
              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                New This Season
              </span>
            ) : null}
          </div>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-black">
          {item.slopScore.toFixed(1)}
        </span>
      </div>

      <p className="mt-3 text-sm text-zinc-400">
        {venue ? `${venue.name} · ${venue.city}, ${venue.state}` : "Unknown venue"}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-2xl bg-black p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
            Verdict
          </p>
          <p className="mt-1 font-bold text-white">{item.verdict}</p>
        </div>
        <div className="rounded-2xl bg-black p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
            Run It Back
          </p>
          <p className="mt-1 font-bold text-white">{item.runItBackPercent}%</p>
        </div>
        <div className="rounded-2xl bg-black p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
            Napkins
          </p>
          <p className="mt-1 font-bold text-white">{item.napkinRating}/5</p>
        </div>
      </div>

      <p className="mt-5 text-sm font-bold text-zinc-300 transition group-hover:text-white">
        View food intel
      </p>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <header className="py-16 text-center">
          <p className="mb-5 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300">
            Fan-powered concession intel for every league
          </p>
          <h1 className="text-6xl font-black leading-none tracking-tight sm:text-7xl lg:text-8xl">
            STADIUM SLOP
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Find what&apos;s worth eating before you hit the concession line.
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-zinc-300">
            Search stadiums, teams, cities, or food items. Fan-powered reviews,
            verified on-site signals, and real concession intel.
          </p>

          <div className="mx-auto mt-10 max-w-3xl rounded-full border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
            <input
              aria-label="Search Stadium Slop"
              readOnly
              placeholder="Search by venue, team, city, or food..."
              className="w-full rounded-full bg-black px-6 py-5 text-lg font-semibold text-white outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-2">
            {quickActionChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                {chip}
              </button>
            ))}
          </div>
        </header>

        <section
          id="trust"
          className="grid gap-3 border-y border-zinc-800 py-6 md:grid-cols-3"
        >
          {[
            "Verified on-site review zones",
            "Fan ratings stay independent",
            "Menus tracked by fans"
          ].map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-center text-sm font-bold text-zinc-300"
            >
              {point}
            </div>
          ))}
        </section>

        <section className="py-14">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Popular Venues
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Jump into the sample venue database.
              </h2>
            </div>
            <Link
              href="/venues"
              className="text-sm font-bold text-zinc-300 hover:text-white"
            >
              Browse all venues
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {venues.map((venue) => (
              <Link
                key={venue.slug}
                href={`/venues/${venue.slug}`}
                className="group rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-500"
              >
                <article>
                  <h3 className="text-xl font-black">{venue.name}</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {venue.city}, {venue.state}
                  </p>
                  <p className="mt-5 text-sm text-zinc-500">
                    {venue.teams.join(", ")}
                  </p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                    {venue.leagues.join(", ")}
                  </p>
                  <p className="mt-5 text-sm font-bold text-zinc-300 transition group-hover:text-white">
                    View venue
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section id="discover" className="space-y-14 border-t border-zinc-800 py-14">
          {discoveryRows.map((row) => (
            <div key={row.title}>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Discover
                  </p>
                  <h2 className="mt-2 text-3xl font-black">{row.title}</h2>
                  <p className="mt-2 text-zinc-400">{row.description}</p>
                </div>
              </div>

              {row.items.length > 0 ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {row.items.map((item) => (
                    <FoodDiscoveryCard key={item.slug} item={item} />
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-zinc-500">
                  No items in this lane yet.
                </p>
              )}
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Independent Ratings
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Sponsored placement never changes the fan signals.
          </h2>
          <p className="mt-4 max-w-3xl text-zinc-400">
            Promoted items are clearly labeled, official ratings are designed to
            come from fans near the venue, and browsing stays public while the
            database grows.
          </p>
        </section>
      </section>
    </main>
  );
}
