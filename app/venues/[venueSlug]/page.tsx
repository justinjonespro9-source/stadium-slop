import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getFoodItemsByVenueSlug,
  getFoodItemsByVendorSlug,
  getVendorForFoodItem,
  getVendorsByVenueSlug,
  getVenueBySlug
} from "@/lib/sample-data";
import {
  getItemSlopStats,
  type ItemSlopStats,
  type SlopStatsMode
} from "@/lib/slop-stats";

type FoodItem = ReturnType<typeof getFoodItemsByVenueSlug>[number];
type StandingsMode = "all-time" | "season" | "fresh";
type CategoryFilter =
  | "all"
  | "food"
  | "sweet"
  | "alcoholic"
  | "non-alcoholic";

const modeOptions: { label: string; value: StandingsMode }[] = [
  { label: "All-Time", value: "all-time" },
  { label: "Season", value: "season" },
  { label: "Game Day Fresh", value: "fresh" }
];

const categoryOptions: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Food", value: "food" },
  { label: "Sweet Treats", value: "sweet" },
  { label: "Alcoholic Drinks", value: "alcoholic" },
  { label: "Non-Alcoholic Drinks", value: "non-alcoholic" }
];

type VenuePageProps = {
  params: Promise<{
    venueSlug: string;
  }>;
  searchParams?: Promise<{
    mode?: string;
    category?: string;
    vendor?: string;
  }>;
};

function sortOverallScoreboardItems(items: FoodItem[], mode: SlopStatsMode) {
  return [...items].sort(
    (a, b) =>
      getItemSlopStats(b.slug, mode).averageSlopScore -
      getItemSlopStats(a.slug, mode).averageSlopScore
  );
}

function sortGameDayScoreboardItems(items: FoodItem[]) {
  return items
    .filter((item) => item.freshSignal && item.freshReviewCount !== undefined)
    .sort((a, b) => {
      const statsA = getItemSlopStats(a.slug, "gameDayFresh");
      const statsB = getItemSlopStats(b.slug, "gameDayFresh");

      if (statsA.averageSlopScore !== statsB.averageSlopScore) {
        return statsB.averageSlopScore - statsA.averageSlopScore;
      }

      return statsB.reviewCount - statsA.reviewCount;
    });
}

function getMode(value?: string): StandingsMode {
  if (value === "season" || value === "fresh" || value === "all-time") {
    return value;
  }

  return "season";
}

function getCategory(value?: string): CategoryFilter {
  if (
    value === "food" ||
    value === "sweet" ||
    value === "alcoholic" ||
    value === "non-alcoholic"
  ) {
    return value;
  }

  return "all";
}

function filterByCategory(item: FoodItem, category: CategoryFilter) {
  if (category === "all") {
    return true;
  }

  if (category === "food") {
    return item.itemType === "Food";
  }

  if (category === "alcoholic") {
    return item.itemType === "Alcoholic Drink";
  }

  if (category === "non-alcoholic") {
    return item.itemType === "Non-Alcoholic Drink";
  }

  return ["sweet", "dessert", "treat"].some((keyword) =>
    `${item.category} ${item.tags.join(" ")}`.toLowerCase().includes(keyword)
  );
}

function buildVenueHref(
  venueSlug: string,
  mode: StandingsMode,
  category: CategoryFilter,
  vendorSlug: string
) {
  const params = new URLSearchParams();

  if (mode !== "season") {
    params.set("mode", mode);
  }

  if (category !== "all") {
    params.set("category", category);
  }

  if (vendorSlug !== "all") {
    params.set("vendor", vendorSlug);
  }

  const query = params.toString();
  return `/venues/${venueSlug}${query ? `?${query}` : ""}`;
}

function FilterChips({
  venueSlug,
  mode,
  category,
  vendorSlug
}: {
  venueSlug: string;
  mode: StandingsMode;
  category: CategoryFilter;
  vendorSlug: string;
}) {
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
      {categoryOptions.map((option) => (
        <Link
          key={option.value}
          href={buildVenueHref(venueSlug, mode, option.value, vendorSlug)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] ${
            category === option.value
              ? "border-white bg-white text-black"
              : "border-zinc-800 bg-black text-zinc-400"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

function ModeChips({
  venueSlug,
  mode,
  category,
  vendorSlug
}: {
  venueSlug: string;
  mode: StandingsMode;
  category: CategoryFilter;
  vendorSlug: string;
}) {
  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {modeOptions.map((option) => (
        <Link
          key={option.value}
          href={buildVenueHref(venueSlug, option.value, category, vendorSlug)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black ${
            mode === option.value
              ? "border-white bg-white text-black"
              : "border-zinc-800 bg-zinc-950 text-zinc-300"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

function VendorChips({
  venueSlug,
  mode,
  category,
  vendorSlug,
  vendors
}: {
  venueSlug: string;
  mode: StandingsMode;
  category: CategoryFilter;
  vendorSlug: string;
  vendors: ReturnType<typeof getVendorsByVenueSlug>;
}) {
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
      <Link
        href={buildVenueHref(venueSlug, mode, category, "all")}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] ${
          vendorSlug === "all"
            ? "border-white bg-white text-black"
            : "border-zinc-800 bg-black text-zinc-400"
        }`}
      >
        All Vendors
      </Link>
      {vendors.map((vendor) => (
        <Link
          key={vendor.slug}
          href={buildVenueHref(venueSlug, mode, category, vendor.slug)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] ${
            vendorSlug === vendor.slug
              ? "border-white bg-white text-black"
              : "border-zinc-800 bg-black text-zinc-400"
          }`}
        >
          {vendor.name}
        </Link>
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
  stats,
  venueSlug,
  showFresh = false
}: {
  item: FoodItem;
  rank: number;
  stats: ItemSlopStats;
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
                {stats.averageSlopScore.toFixed(1)}
              </p>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-600">
                {showFresh ? "Fresh" : "Slop"}
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
            <span>{item.itemType}</span>
            <span>{stats.reviewCount} reviews</span>
            <span>{stats.roundedNapkinRating}/5 napkins</span>
            {stats.topConsensus ? (
              <span>
                {stats.topConsensus.percentage}% {stats.topConsensus.label}
              </span>
            ) : null}
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

export default async function VenuePage({ params, searchParams }: VenuePageProps) {
  const { venueSlug } = await params;
  const query = await searchParams;
  const venue = getVenueBySlug(venueSlug);

  if (!venue) {
    notFound();
  }

  const venueFoodItems = getFoodItemsByVenueSlug(venue.slug).sort(
    (a, b) => b.slopScore - a.slopScore
  );
  const venueVendors = getVendorsByVenueSlug(venue.slug);
  const mode = getMode(query?.mode);
  const category = getCategory(query?.category);
  const vendorSlug = query?.vendor ?? "all";
  const selectedVendor = venueVendors.find((vendor) => vendor.slug === vendorSlug);
  const statsMode: SlopStatsMode =
    mode === "fresh" ? "gameDayFresh" : mode === "season" ? "season" : "allTime";
  const filteredItems = venueFoodItems.filter(
    (item) =>
      filterByCategory(item, category) &&
      (vendorSlug === "all" || item.vendorSlug === vendorSlug)
  );
  const standingsItems =
    mode === "fresh"
      ? sortGameDayScoreboardItems(filteredItems)
      : sortOverallScoreboardItems(filteredItems, statsMode);
  const modeLabel =
    mode === "fresh"
      ? "Game Day Fresh"
      : mode === "all-time"
        ? "All-Time"
        : "Season";
  const scoreLabel = mode === "fresh" ? "Fresh" : "Slop";

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
                Standings
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                {modeLabel} items at {venue.name}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Sorted by {scoreLabel} Score. Pick a mode, category, or vendor.
              </p>
            </div>
            <ModeChips
              venueSlug={venue.slug}
              mode={mode}
              category={category}
              vendorSlug={vendorSlug}
            />
            <FilterChips
              venueSlug={venue.slug}
              mode={mode}
              category={category}
              vendorSlug={vendorSlug}
            />
            <VendorChips
              venueSlug={venue.slug}
              mode={mode}
              category={category}
              vendorSlug={vendorSlug}
              vendors={venueVendors}
            />
            {selectedVendor ? (
              <Link
                href={`/venues/${venue.slug}/vendors/${selectedVendor.slug}`}
                className="mt-3 inline-flex text-sm font-bold text-zinc-400 hover:text-white"
              >
                Open {selectedVendor.name} vendor page
              </Link>
            ) : null}
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
            {standingsItems.length > 0 ? (
              standingsItems.map((item, index) => (
                <ItemStandingRow
                  key={item.slug}
                  item={item}
                  rank={index + 1}
                  stats={getItemSlopStats(item.slug, statsMode)}
                  venueSlug={venue.slug}
                  showFresh={mode === "fresh"}
                />
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-zinc-500">
                No items match these filters yet.
              </p>
            )}
          </div>
        </section>

        <section className="border-t border-zinc-800 py-5 sm:py-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Vendors
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Browse stands.</h2>
          </div>

          <div className="mt-4 grid gap-2">
            {venueVendors.map((vendor) => {
              const vendorItems = getFoodItemsByVendorSlug(vendor.slug);

              return (
                <Link
                  key={vendor.slug}
                  href={`/venues/${venue.slug}/vendors/${vendor.slug}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-500"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black">{vendor.name}</h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {vendor.section} · {vendor.location}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-zinc-500">
                      {vendorItems.length} items
                    </span>
                  </div>
                </Link>
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
