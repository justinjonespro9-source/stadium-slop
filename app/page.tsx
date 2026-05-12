import Link from "next/link";

import {
  foodItems,
  foodPhotos,
  getVendorForFoodItem,
  getVenueForFoodItem,
  venues
} from "@/lib/sample-data";

const popularSearches = venues.slice(0, 3);
const freshSignalPriority: Record<string, number> = {
  "Fans Say Skip": 0,
  "Falling Fast": 1,
  "Cold Streak": 2,
  "Line Trouble": 3,
  "Hot Today": 4,
  "Holding Strong": 5,
  "Mixed Signals": 6
};
const gameDayFreshItems = [...foodItems]
  .filter((item) => item.freshSignal)
  .sort((a, b) => {
    const priorityA = a.freshSignal
      ? freshSignalPriority[a.freshSignal] ?? 99
      : 99;
    const priorityB = b.freshSignal
      ? freshSignalPriority[b.freshSignal] ?? 99
      : 99;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return (b.freshReviewCount ?? 0) - (a.freshReviewCount ?? 0);
  });
const seasonStandingsItems = [...foodItems].sort(
  (a, b) => b.slopScore - a.slopScore
);
const worthTheWalkItems = foodItems.filter((item) =>
  ["Worth the Wait", "Quick Stop"].includes(item.lineWaitLabel)
);
const napkinLegends = [...foodItems].sort(
  (a, b) => b.napkinRating - a.napkinRating
);

function getPhotoPlaceholder(foodSlug: string) {
  return (
    foodPhotos.find((photo) => photo.foodSlug === foodSlug)?.imagePlaceholder ??
    "🍽️"
  );
}

function ItemSpotlightCard({
  item,
  compact = false
}: {
  item: (typeof foodItems)[number];
  compact?: boolean;
}) {
  const venue = getVenueForFoodItem(item);
  const vendor = getVendorForFoodItem(item);

  return (
    <Link
      href={`/venues/${item.venueSlug}/${item.slug}`}
      className="group block overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 transition hover:border-zinc-500"
    >
      <div
        className={`flex items-center justify-center bg-black ${
          compact ? "h-28 text-6xl" : "h-40 text-7xl"
        }`}
      >
        {getPhotoPlaceholder(item.slug)}
      </div>
      <div className={compact ? "p-4" : "p-5"}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              {venue?.name ?? "Venue TBD"}
            </p>
            <h3 className="mt-1 text-xl font-black">{item.name}</h3>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-black">
            {item.slopScore.toFixed(1)}
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          {vendor?.name ?? "Vendor TBD"} · {item.location}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
          {item.freshSignal ? <span>{item.freshSignal}</span> : null}
          <span>{item.reviewCount} reviews</span>
          <span>{item.napkinRating}/5 napkins</span>
        </div>
        <p className="mt-4 text-sm font-bold text-zinc-300 transition group-hover:text-white">
          Open seat intel
        </p>
      </div>
    </Link>
  );
}

export default function Home() {
  const heroItem = gameDayFreshItems[0] ?? seasonStandingsItems[0];

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10">
        <header className="grid gap-6 py-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Eats in the Seats
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight sm:text-7xl">
              STADIUM SLOP
            </h1>
            <p className="mt-5 text-2xl font-black leading-tight tracking-tight sm:text-4xl">
              Live stadium food intel from fans already in the seats.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
              Search venues, check Game Day Fresh, and dodge the cold nachos
              before you burn a timeout in the concession line.
            </p>

            <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
              <input
                aria-label="Search Stadium Slop"
                readOnly
                placeholder="Search for a venue, team, city, or stadium..."
                className="w-full rounded-[1.5rem] bg-black px-5 py-5 text-base font-semibold text-white outline-none placeholder:text-zinc-500 sm:text-lg"
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

            <div className="mt-5">
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
          </div>

          {heroItem ? (
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Live from the concourse
              </p>
              <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-[1.5rem] bg-black text-8xl">
                {getPhotoPlaceholder(heroItem.slug)}
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">{heroItem.name}</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    {getVenueForFoodItem(heroItem)?.name} ·{" "}
                    {getVendorForFoodItem(heroItem)?.name}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-black">
                  {heroItem.freshSignalScore?.toFixed(1) ??
                    heroItem.slopScore.toFixed(1)}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-300">
                {heroItem.freshSignalReason ?? heroItem.description}
              </p>
              <Link
                href={`/venues/${heroItem.venueSlug}/${heroItem.slug}`}
                className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
              >
                View Slop Card
              </Link>
            </div>
          ) : null}
        </header>

        <section className="grid gap-3 border-y border-zinc-800 py-5 sm:grid-cols-3">
          {[
            "Verified game-day reviews",
            "Season Standings by venue",
            "Helpful only, no comment chaos"
          ].map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-bold text-zinc-300"
            >
              {point}
            </div>
          ))}
        </section>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Game Day Fresh
              </p>
              <h2 className="mt-2 text-3xl font-black">
                What fans are seeing right now.
              </h2>
            </div>
            <Link href="/venues" className="text-sm font-bold text-zinc-400 hover:text-white">
              All venues
            </Link>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {gameDayFreshItems.slice(0, 3).map((item) => (
              <ItemSpotlightCard key={item.slug} item={item} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 py-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Season Standings
            </p>
            <div className="mt-5 space-y-3">
              {seasonStandingsItems.slice(0, 5).map((item, index) => (
                <Link
                  key={item.slug}
                  href={`/venues/${item.venueSlug}/${item.slug}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-black p-4 transition hover:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-black">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {getVenueForFoodItem(item)?.name} ·{" "}
                        {getVendorForFoodItem(item)?.name}
                      </p>
                    </div>
                  </div>
                  <span className="font-black">{item.slopScore.toFixed(1)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Most Helpful Fans
              </p>
              <div className="mt-5 space-y-4">
                {[
                  ["Section 126 Snack Scout", "18 helpful taps"],
                  ["Upper Deck Auditor", "14 helpful taps"],
                  ["Hockey Night Plate Cam", "11 helpful taps"]
                ].map(([fan, helpful]) => (
                  <div key={fan} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{fan}</p>
                      <p className="text-sm text-zinc-500">Verified game-day</p>
                    </div>
                    <span className="text-sm font-bold text-zinc-400">
                      {helpful}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Worth the Walk
              </p>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {worthTheWalkItems.slice(0, 3).map((item) => (
                  <ItemSpotlightCard key={item.slug} item={item} compact />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 py-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Trending Slop
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Hot trays, cold takes, live from the stands.
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {gameDayFreshItems.slice(3, 5).map((item) => (
                <ItemSpotlightCard key={item.slug} item={item} compact />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              5-Napkin Legends
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Jersey-risk decisions fans still talk about.
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {napkinLegends.slice(0, 2).map((item) => (
                <ItemSpotlightCard key={item.slug} item={item} compact />
              ))}
            </div>
          </div>
        </section>

        <section
          id="trust"
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
        >
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
