import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getFoodItemsByVenueSlug,
  getFoodItemsByVendorSlug,
  getVendorForFoodItem,
  getVendorsByVenueSlug,
  getVenueBySlug
} from "@/lib/sample-data";

type FoodItem = ReturnType<typeof getFoodItemsByVenueSlug>[number];
type FreshSignal = NonNullable<FoodItem["freshSignal"]>;

const filterChips = [
  "All",
  "Food",
  "Sweet Treats",
  "Alcoholic Drinks",
  "Non-Alcoholic Drinks"
];

const freshSignalPriority: Record<FreshSignal, number> = {
  "Fans Say Skip": 0,
  "Falling Fast": 1,
  "Cold Streak": 2,
  "Line Trouble": 3,
  "Hot Today": 4,
  "Holding Strong": 5,
  "Mixed Signals": 6
};

type VenuePageProps = {
  params: Promise<{
    venueSlug: string;
  }>;
};

function sortOverallScoreboardItems(items: FoodItem[]) {
  return [...items].sort((a, b) => {
    const rankA = a.scoreboardRank;
    const rankB = b.scoreboardRank;

    if (rankA !== undefined && rankB !== undefined) {
      return rankA - rankB;
    }

    if (rankA !== undefined) {
      return -1;
    }

    if (rankB !== undefined) {
      return 1;
    }

    return b.slopScore - a.slopScore;
  });
}

function sortGameDayScoreboardItems(items: FoodItem[]) {
  return items
    .filter((item) => item.freshSignal && item.freshReviewCount !== undefined)
    .sort((a, b) => {
      const priorityA = a.freshSignal
        ? freshSignalPriority[a.freshSignal]
        : Number.POSITIVE_INFINITY;
      const priorityB = b.freshSignal
        ? freshSignalPriority[b.freshSignal]
        : Number.POSITIVE_INFINITY;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return (b.freshReviewCount ?? 0) - (a.freshReviewCount ?? 0);
    });
}

function FilterChips() {
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
      {filterChips.map((chip) => (
        <button
          key={chip}
          type="button"
          className="shrink-0 rounded-full border border-zinc-800 bg-black px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

function formatSections(item: FoodItem) {
  if (!item.sections || item.sections.length === 0) {
    return item.location;
  }

  if (item.sections.length > 2) {
    return "Multiple sections";
  }

  return `Sections ${item.sections.join(", ")}`;
}

function ItemStandingRow({
  item,
  rank,
  venueSlug,
  showFresh = false
}: {
  item: FoodItem;
  rank: number;
  venueSlug: string;
  showFresh?: boolean;
}) {
  const vendor = getVendorForFoodItem(item);

  return (
    <Link
      href={`/venues/${venueSlug}/${item.slug}`}
      className="group block border-b border-zinc-800 bg-zinc-950 px-4 py-4 transition last:border-b-0 hover:bg-black sm:px-5"
    >
      <article className="grid grid-cols-[auto_1fr] gap-3">
        <div className="pt-1 text-sm font-black text-zinc-500">#{rank}</div>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-white sm:text-lg">
                  {item.name}
                </h3>
                {item.ageRestricted ? (
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-300">
                    21+
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                {vendor ? vendor.name : "Vendor TBD"} · {formatSections(item)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white">
                {showFresh && item.freshSignalScore
                  ? item.freshSignalScore.toFixed(1)
                  : item.slopScore.toFixed(1)}
              </p>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-600">
                {showFresh ? "Fresh" : "Slop"}
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
            <span>{item.itemType}</span>
            <span>{item.reviewCount} reviews</span>
            <span>{item.napkinRating}/5 napkins</span>
            {item.reportedPrice ? (
              <span>${item.reportedPrice.toFixed(2)}</span>
            ) : null}
            {item.freshSignal ? (
              <span>{item.freshSignal}</span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { venueSlug } = await params;
  const venue = getVenueBySlug(venueSlug);

  if (!venue) {
    notFound();
  }

  const venueFoodItems = getFoodItemsByVenueSlug(venue.slug).sort(
    (a, b) => b.slopScore - a.slopScore
  );
  const venueVendors = getVendorsByVenueSlug(venue.slug);
  const overallScoreboardItems = sortOverallScoreboardItems(venueFoodItems);
  const gameDayScoreboardItems = sortGameDayScoreboardItems(venueFoodItems);

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10">
        <Link
          href="/venues"
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to venues
        </Link>

        <header className="py-4 sm:py-8">
          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {venue.name}
          </h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            {venue.city}, {venue.state} · {venue.venueType}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            {venue.leagues.join(", ")} · {venue.teams.join(", ")} ·{" "}
            {venue.sports.join(", ")}
          </p>
        </header>

        <p className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs leading-5 text-zinc-500">
          Verified reviews require fans to be within {venue.reviewRadiusMeters}m.
          Menus change fast, so check availability at the venue.
        </p>

        <section className="border-t border-zinc-800 py-5 sm:py-8">
          <div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Season Standings
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Long-term Slop Score rankings from verified fan reviews.
              </h2>
            </div>
            <FilterChips />
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
            {overallScoreboardItems.map((item, index) => (
              <ItemStandingRow
                key={item.slug}
                item={item}
                rank={item.scoreboardRank ?? index + 1}
                venueSlug={venue.slug}
              />
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-800 py-5 sm:py-8">
          <div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Game Day Fresh
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Today&apos;s Fresh Signal from current-event verified reviews.
              </h2>
            </div>
            <FilterChips />
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
            {gameDayScoreboardItems.map((item, index) => (
              <ItemStandingRow
                key={item.slug}
                item={item}
                rank={index + 1}
                venueSlug={venue.slug}
                showFresh
              />
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-800 py-5 sm:py-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Vendors / Menu
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Venue to vendor to item.
            </h2>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {venueVendors.map((vendor) => {
              const vendorItems = getFoodItemsByVendorSlug(vendor.slug);

              return (
                <article
                  key={vendor.slug}
                  className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black sm:text-2xl">
                        {vendor.name}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {vendor.section} · {vendor.location}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-black">
                      {vendor.averageSlopScore.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                    <span>{vendorItems.length} items</span>
                    <span>Avg {vendor.averageSlopScore.toFixed(1)}</span>
                  </div>
                  <p className="mt-3 rounded-2xl bg-black p-3 text-sm leading-6 text-zinc-400">
                    {vendor.lineIntel ?? "Line intel coming soon"}
                  </p>

                  <div className="mt-4 space-y-2">
                    {vendorItems.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/venues/${venue.slug}/${item.slug}`}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-black p-3 transition hover:bg-zinc-900"
                      >
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {item.itemType} · {formatSections(item)}
                          </p>
                        </div>
                        <span className="text-sm font-black text-white">
                          {item.slopScore.toFixed(1)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          <article className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Don&apos;t see your food?
            </p>
            <h3 className="mt-2 text-xl font-black sm:text-2xl">Add it</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
              Fans will be able to suggest missing vendors, sections, prices,
              and reviewable items after sign-in.
            </p>
            <button
              type="button"
              disabled
              className="mt-5 cursor-not-allowed rounded-full border border-zinc-700 px-6 py-3 text-sm font-bold text-zinc-500"
            >
              Add item coming soon
            </button>
          </article>
        </section>

      </section>
    </main>
  );
}
