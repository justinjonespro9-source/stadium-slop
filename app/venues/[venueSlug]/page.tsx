import Link from "next/link";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import {
  type FoodItem,
  type Vendor
} from "@/lib/sample-data";
import {
  getPublicFoodItemsByVenueSlug,
  getPublicVenueBySlug,
  getPublicVendorsByVenueSlug
} from "@/lib/public-data";
import {
  eventVenueHint,
  venueTypeGlyph
} from "@/lib/venue-display";
import {
  getDbBackedItemSlopStats,
  getSlopScoreTier,
  type ItemSlopStats,
  type SlopStatsMode
} from "@/lib/slop-stats";
import { isNapkinEligibleItem } from "@/lib/item-eligibility";
import { prisma } from "@/lib/prisma";
import { ensureMockReviewerUser } from "@/lib/mock-user";
import { MOCK_USER_COOKIE_NAME, hasMockUserAccess } from "@/lib/user-auth";

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

async function suggestMissingItem(formData: FormData) {
  "use server";

  const venueSlug = String(formData.get("venueSlug") ?? "");
  const vendorSlug = String(formData.get("vendorSlug") ?? "");
  const name = String(formData.get("itemName") ?? "").trim();
  const locationHint = String(formData.get("locationHint") ?? "").trim();
  const note = String(formData.get("suggestedItemNote") ?? "").trim();
  const venuePath = `/venues/${venueSlug}`;
  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );

  if (!isSignedIn) {
    redirect(`/login?next=${encodeURIComponent(venuePath)}`);
  }

  if (!name) {
    redirect(`${venuePath}?suggestion=missing-name`);
  }

  const venue = await prisma.venue.findUnique({ where: { slug: venueSlug } });

  if (!venue) {
    redirect(venuePath);
  }

  const vendor = vendorSlug
    ? await prisma.vendor.findUnique({
        where: {
          venueId_slug: {
            venueId: venue.id,
            slug: vendorSlug
          }
        }
      })
    : null;
  const user = await ensureMockReviewerUser(venue.id);

  await prisma.suggestedItem.create({
    data: {
      venueId: venue.id,
      vendorId: vendor?.id,
      userId: user.id,
      name: name.slice(0, 120),
      locationHint: locationHint ? locationHint.slice(0, 160) : null,
      note: note ? note.slice(0, 240) : null
    }
  });

  revalidatePath(venuePath);
  redirect(`${venuePath}?suggestion=submitted`);
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
              ? "border-[var(--slop-orange)] bg-[var(--slop-orange)] text-[var(--slop-ink)]"
              : "border-[var(--slop-line)] bg-[var(--slop-ink)] text-[var(--slop-cream)]"
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
              ? "border-[var(--slop-orange)] bg-[var(--slop-orange)] text-[var(--slop-ink)]"
              : "border-[var(--slop-line)] bg-[var(--slop-surface)] text-[var(--slop-cream)]"
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
  vendors: Vendor[];
}) {
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
      <Link
        href={buildVenueHref(venueSlug, mode, category, "all")}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] ${
          vendorSlug === "all"
            ? "border-[var(--slop-orange)] bg-[var(--slop-orange)] text-[var(--slop-ink)]"
            : "border-[var(--slop-line)] bg-[var(--slop-ink)] text-[var(--slop-cream)]"
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
              ? "border-[var(--slop-orange)] bg-[var(--slop-orange)] text-[var(--slop-ink)]"
              : "border-[var(--slop-line)] bg-[var(--slop-ink)] text-[var(--slop-cream)]"
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
  vendor,
  showFresh = false
}: {
  item: FoodItem;
  rank: number;
  stats: ItemSlopStats;
  venueSlug: string;
  vendor?: Vendor;
  showFresh?: boolean;
}) {
  const napkinEligible = isNapkinEligibleItem(item);

  return (
    <Link
      href={`/venues/${venueSlug}/${item.slug}`}
      className="group block border-b border-[var(--slop-line)] bg-[var(--slop-surface)] px-4 py-4 transition last:border-b-0 hover:bg-[var(--slop-ink)] sm:px-5"
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
              <p className="text-lg font-black text-[var(--slop-orange)]">
                {stats.averageSlopScore.toFixed(1)}
              </p>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-600">
                {showFresh ? "Fresh" : getSlopScoreTier(stats.averageSlopScore)}
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
            <span>{item.itemType}</span>
            <span>{stats.reviewCount} reviews</span>
            {napkinEligible ? (
              <span>{stats.roundedNapkinRating}/5 napkins</span>
            ) : null}
            {stats.topReplayValue ? (
              <span>
                {stats.topReplayValue.percentage}% {stats.topReplayValue.label}
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
  const venue = await getPublicVenueBySlug(venueSlug);

  if (!venue) {
    notFound();
  }

  const venueFoodItems = await getPublicFoodItemsByVenueSlug(venue.slug);
  const venueVendors = await getPublicVendorsByVenueSlug(venue.slug);
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
  const itemStats = await Promise.all(
    filteredItems.map(async (item) => ({
      item,
      stats: await getDbBackedItemSlopStats(venue.slug, item.slug, statsMode)
    }))
  );
  const standingsItems = itemStats
    .filter(({ item, stats }) =>
      mode === "fresh" ? item.freshSignal || stats.reviewCount > 0 : true
    )
    .sort((a, b) => {
      if (b.stats.averageSlopScore !== a.stats.averageSlopScore) {
        return b.stats.averageSlopScore - a.stats.averageSlopScore;
      }

      return b.stats.reviewCount - a.stats.reviewCount;
    });
  const modeLabel =
    mode === "fresh"
      ? "Game Day Fresh"
      : mode === "all-time"
        ? "All-Time"
        : "Season";
  const scoreLabel = mode === "fresh" ? "Fresh" : "Slop";
  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );
  const signatureEventHint = eventVenueHint(venue.recurringEvents ?? []);

  return (
    <main className="brand-page min-h-screen">
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
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                {venue.city}, {venue.state}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-zinc-300">
                {venue.venueTypeKey ? (
                  <span className="text-base leading-none opacity-90" aria-hidden>
                    {venueTypeGlyph(venue.venueTypeKey) ?? ""}
                  </span>
                ) : null}
                {venue.venueType}
              </span>
              {venue.primarySport ? (
                <>
                  <span className="text-zinc-600">·</span>
                  <span>{venue.primarySport}</span>
                </>
              ) : null}
            </span>
          </p>
          {venue.surfaceType ? (
            <p className="mt-1 text-xs text-zinc-500">{venue.surfaceType}</p>
          ) : null}
          {signatureEventHint ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
              {signatureEventHint}
            </p>
          ) : null}
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            {venue.leagues.join(", ")} · {venue.teams.join(", ")} ·{" "}
            {venue.sports.join(", ")}
          </p>
        </header>

        <p className="brand-panel rounded-2xl border px-4 py-3 text-xs leading-5 text-[color:rgba(255,244,223,0.58)]">
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

          <div className="mt-4 overflow-hidden rounded-3xl border border-[var(--slop-line)] bg-[var(--slop-surface)]">
            {standingsItems.length > 0 ? (
              standingsItems.map(({ item, stats }, index) => (
                <ItemStandingRow
                  key={item.slug}
                  item={item}
                  rank={index + 1}
                  stats={stats}
                  vendor={venueVendors.find(
                    (vendor) => vendor.slug === item.vendorSlug
                  )}
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
              const vendorItems = venueFoodItems.filter(
                (item) => item.vendorSlug === vendor.slug
              );

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
            <h3 className="mt-2 text-xl font-black sm:text-2xl">
              Suggest a missing item
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
              Fan suggestions are saved as pending approval so admins can review
              duplicates, sections, and venue accuracy.
            </p>
            {isSignedIn ? (
              <form action={suggestMissingItem} className="mt-4 grid gap-3">
                <input type="hidden" name="venueSlug" value={venue.slug} />
                <input
                  name="itemName"
                  required
                  placeholder="Missing item name"
                  className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
                />
                <select
                  name="vendorSlug"
                  className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
                  defaultValue=""
                >
                  <option value="">Vendor unknown</option>
                  {venueVendors.map((vendor) => (
                    <option key={vendor.slug} value={vendor.slug}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                <input
                  name="locationHint"
                  placeholder="Optional section or location"
                  className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
                />
                <textarea
                  name="suggestedItemNote"
                  maxLength={240}
                  placeholder="Optional: price, stand, or menu context"
                  className="min-h-20 rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
                />
                <button
                  type="submit"
                  className="brand-cta rounded-full px-6 py-3 text-sm font-black"
                >
                  Submit suggestion
                </button>
              </form>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(`/venues/${venue.slug}`)}`}
                className="mt-5 inline-flex rounded-full border border-zinc-700 px-6 py-3 text-sm font-bold text-zinc-400"
              >
                Sign in to suggest an item
              </Link>
            )}
          </article>
        </section>

      </section>
    </main>
  );
}
