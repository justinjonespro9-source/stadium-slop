import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getFoodItemBySlug,
  getFoodItemsByVenueSlug,
  getFoodItemsByVendorSlug,
  getPhotosForVenue,
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
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {filterChips.map((chip) => (
        <button
          key={chip}
          type="button"
          className="shrink-0 rounded-full border border-zinc-800 bg-black px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

function LeaderboardCard({
  item,
  rank,
  venueSlug
}: {
  item: FoodItem;
  rank: number;
  venueSlug: string;
}) {
  const vendor = getVendorForFoodItem(item);

  return (
    <Link
      href={`/venues/${venueSlug}/${item.slug}`}
      className="group block rounded-3xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-500 sm:p-5"
    >
      <article className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-base font-black text-black sm:h-12 sm:w-12 sm:text-lg">
          #{rank}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black sm:text-2xl">{item.name}</h3>
            {item.ageRestricted ? (
              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                21+
              </span>
            ) : null}
            {item.venueBadge ? (
              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                {item.venueBadge}
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500 sm:text-sm">
            {item.itemType} · {vendor ? vendor.name : "Vendor TBD"}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div className="rounded-2xl bg-black p-3">
              <p className="text-zinc-500">Slop Score</p>
              <p className="mt-1 text-lg font-black text-white">
                {item.slopScore.toFixed(1)}
              </p>
            </div>
            <div className="rounded-2xl bg-black p-3">
              <p className="text-zinc-500">Verdict</p>
              <p className="mt-1 font-bold text-white">{item.verdict}</p>
            </div>
            <div className="rounded-2xl bg-black p-3">
              <p className="text-zinc-500">Run It Back</p>
              <p className="mt-1 text-lg font-black text-white">
                {item.runItBackPercent}%
              </p>
            </div>
            <div className="rounded-2xl bg-black p-3">
              <p className="text-zinc-500">Fresh Signal</p>
              <p className="mt-1 font-bold text-white">
                {item.freshSignalScore
                  ? `${item.freshSignalScore.toFixed(1)}`
                  : "No fresh signal"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
            <span>{item.reviewCount} reviews</span>
            <span>{item.napkinRating}/5 napkins</span>
            {item.reportedPrice ? (
              <span>${item.reportedPrice.toFixed(2)} reported</span>
            ) : null}
          </div>

          {item.freshSignal ? (
            <p className="mt-3 text-sm text-zinc-400">
              {item.freshSignal} · {item.freshReviewCount} fresh reviews{" "}
              {item.freshWindowLabel}
            </p>
          ) : null}

          <p className="mt-4 text-sm font-bold text-zinc-300 transition group-hover:text-white">
            View item details
          </p>
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
  const newThisSeasonItems = venueFoodItems.filter(
    (item) => item.isNewThisSeason
  );
  const latestPhotos = getPhotosForVenue(venue.slug).slice(0, 6);

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10">
        <Link
          href="/venues"
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to venues
        </Link>

        <header className="py-6 sm:py-10">
          <p className="mb-3 inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
            {venue.venueType}
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {venue.name}
          </h1>
          <p className="mt-3 text-base text-zinc-300 sm:text-lg">
            {venue.city}, {venue.state}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400 sm:text-sm">
            <span className="rounded-full border border-zinc-800 px-3 py-1.5">
              {venue.leagues.join(", ")}
            </span>
            <span className="rounded-full border border-zinc-800 px-3 py-1.5">
              {venue.teams.join(", ")}
            </span>
            <span className="rounded-full border border-zinc-800 px-3 py-1.5">
              {venue.sports.join(", ")}
            </span>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Verified Review Zone
            </p>
            <h2 className="mt-2 text-xl font-black">
              {venue.reviewRadiusMeters} meters
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Official reviews will require fans to be near {venue.name}.
            </p>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Accuracy Note
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Menus change fast. Check availability at the venue.
            </p>
          </section>
        </div>

        <section className="border-t border-zinc-800 py-7 sm:py-10">
          <div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Slop Standings
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Long-term rankings from verified fan reviews.
              </h2>
            </div>
            <FilterChips />
          </div>

          <div className="mt-5 grid gap-3 sm:gap-4">
            {overallScoreboardItems.map((item, index) => (
              <LeaderboardCard
                key={item.slug}
                item={item}
                rank={item.scoreboardRank ?? index + 1}
                venueSlug={venue.slug}
              />
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-800 py-7 sm:py-10">
          <div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Game Day Pulse
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Fresh Signal from today&apos;s verified on-site reviews.
              </h2>
            </div>
            <FilterChips />
          </div>

          <div className="mt-5 grid gap-3 sm:gap-4">
            {gameDayScoreboardItems.map((item, index) => (
              <LeaderboardCard
                key={item.slug}
                item={item}
                rank={index + 1}
                venueSlug={venue.slug}
              />
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-800 py-7 sm:py-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Vendors / Menu
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Venue to vendor to item.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
              Vendors organize reviewable items. Vendor updates do not count as
              fan reviews.
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
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
                            {item.itemType} · {item.location}
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

        <section className="border-t border-zinc-800 py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Latest Fan Photos
              </p>
              <h2 className="mt-2 text-3xl font-black">
                What fans are seeing at {venue.name}
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Recent verified seat shots from this venue.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestPhotos.map((photo) => {
              const item = getFoodItemBySlug(photo.foodSlug);

              return (
                <Link
                  key={photo.id}
                  href={`/venues/${photo.venueSlug}/${photo.foodSlug}`}
                  className="group rounded-3xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-500"
                >
                  <div
                    aria-label={photo.alt}
                    className="flex aspect-video items-center justify-center rounded-2xl bg-black text-6xl"
                  >
                    {photo.imagePlaceholder}
                  </div>
                  <p className="mt-4 font-bold">
                    {item ? item.name : "Unknown item"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{photo.caption}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>{photo.createdAt}</span>
                    {photo.verifiedOnSite ? (
                      <span className="rounded-full border border-zinc-800 px-2 py-0.5 font-bold uppercase tracking-[0.15em] text-zinc-400">
                        Verified on-site
                      </span>
                    ) : null}
                    {photo.verifiedOnSite && photo.createdAt === "May 2026" ? (
                      <span className="rounded-full border border-zinc-800 px-2 py-0.5 font-bold uppercase tracking-[0.15em] text-zinc-400">
                        Verified today
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-t border-zinc-800 py-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              New This Season
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Fresh concession reports
            </h2>
          </div>

          {newThisSeasonItems.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {newThisSeasonItems.map((item) => (
                <Link
                  key={item.slug}
                  href={`/venues/${venue.slug}/${item.slug}`}
                  className="group rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-500"
                >
                  <article>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black">{item.name}</h3>
                      {item.ageRestricted ? (
                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                          21+
                        </span>
                      ) : null}
                      <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                        New This Season
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-zinc-400">
                      {item.itemType} · {item.category} · {item.location}
                    </p>
                    {item.seasonIntroduced ? (
                      <p className="mt-2 text-sm text-zinc-500">
                        Introduced: {item.seasonIntroduced}
                      </p>
                    ) : null}
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-zinc-500">
              No new items reported yet.
            </p>
          )}
        </section>

      </section>
    </main>
  );
}
