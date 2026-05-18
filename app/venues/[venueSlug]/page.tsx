import Link from "next/link";
import type { Metadata } from "next";
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
  getDbBackedItemSlopStats,
  type ItemSlopStats,
  type SlopStatsMode
} from "@/lib/slop-stats";
import { prisma } from "@/lib/prisma";
import { ensureMockReviewerUser } from "@/lib/mock-user";
import { MOCK_USER_COOKIE_NAME, hasMockUserAccess } from "@/lib/user-auth";
import { VenueVendorSelect } from "@/components/venue-vendor-select";
import { itemMatchesVenueSearch } from "@/lib/venue-standings-search";
import { getAbsoluteUrl, SITE_TAGLINE_SHORT } from "@/lib/site-metadata";
import { formatHomeOfTeams, formatVenueTeamsInline } from "@/lib/venue-teams";
import { buildVenueAwardBoards } from "@/lib/venue-awards";
import { VenueAwardBoards } from "@/components/venue-award-boards";
import { ClaimListingCta } from "@/components/claim-listing-cta";
import { SuggestCorrectionLink } from "@/components/suggest-correction-link";
import {
  FanPoweredGuideBadge,
  FanPoweredGuideNote
} from "@/components/fan-powered-guide-note";
import { AgeGateProvider } from "@/components/age-gate/age-gate-context";
import { VenueStandingsAgeGate } from "@/components/age-gate/venue-standings-age-gate";
import { isAlcoholRelatedFoodItem } from "@/lib/alcohol-content";

type StandingsMode = "all-time" | "season" | "fresh";
type CategoryFilter =
  | "all"
  | "food"
  | "drinks"
  | "sweets"
  | "vegan-gf"
  | "reviewed";

const modeOptions: { label: string; value: StandingsMode }[] = [
  { label: "All-Time", value: "all-time" },
  { label: "Season", value: "season" },
  { label: "Fresh", value: "fresh" }
];

const categoryOptions: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Food", value: "food" },
  { label: "Drinks", value: "drinks" },
  { label: "Sweets", value: "sweets" },
  { label: "Vegan/GF", value: "vegan-gf" },
  { label: "Reviewed", value: "reviewed" }
];

type VenuePageProps = {
  params: Promise<{
    venueSlug: string;
  }>;
  searchParams?: Promise<{
    mode?: string;
    category?: string;
    vendor?: string;
    q?: string;
  }>;
};

export async function generateMetadata({
  params
}: Pick<VenuePageProps, "params">): Promise<Metadata> {
  const { venueSlug } = await params;
  const venue = await getPublicVenueBySlug(venueSlug);

  if (!venue) {
    return {
      title: "Venue",
      description: SITE_TAGLINE_SHORT,
      robots: { index: false, follow: true }
    };
  }

  const homeOfTeams = formatHomeOfTeams(venue.teams, venue.slug);
  const description = [
    `${venue.name} — Game Day concession rankings in ${venue.city}, ${venue.state}.`,
    homeOfTeams ? `Home of ${homeOfTeams}.` : null,
    SITE_TAGLINE_SHORT
  ]
    .filter(Boolean)
    .join(" ");

  const path = `/venues/${venue.slug}`;

  return {
    title: venue.name,
    description,
    alternates: { canonical: getAbsoluteUrl(path) },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Stadium Slop",
      url: getAbsoluteUrl(path),
      title: `${venue.name} · Game Day Rankings`,
      description
    },
    twitter: {
      card: "summary_large_image",
      title: `${venue.name} rankings`,
      description
    }
  };
}

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
  const allowed: CategoryFilter[] = [
    "all",
    "food",
    "drinks",
    "sweets",
    "vegan-gf",
    "reviewed"
  ];
  if (value && allowed.includes(value as CategoryFilter)) {
    return value as CategoryFilter;
  }
  if (value === "sweet") {
    return "sweets";
  }
  if (value === "alcoholic" || value === "non-alcoholic") {
    return "drinks";
  }

  return "all";
}

function itemPassesCategory(item: FoodItem, category: CategoryFilter) {
  if (category === "all" || category === "reviewed") {
    return true;
  }

  if (category === "food") {
    return item.itemType === "Food";
  }

  if (category === "drinks") {
    return (
      item.itemType === "Alcoholic Drink" || item.itemType === "Non-Alcoholic Drink"
    );
  }

  if (category === "sweets") {
    const blob = `${item.category} ${item.tags.join(" ")} ${item.name}`.toLowerCase();
    return ["sweet", "dessert", "treat", "shake", "sundae", "cannoli", "donut", "gelato", "ice cream", "frost", "candy", "churro", "brownie", "cookie"].some(
      (keyword) => blob.includes(keyword)
    );
  }

  if (category === "vegan-gf") {
    const upper = `${item.category} ${item.tags.join(" ")}`.toUpperCase();
    const lower = `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
    return (
      upper.includes("VEGAN") ||
      upper.includes("GLUTEN") ||
      upper.includes("GLUTEN_FREE") ||
      lower.includes("vegan") ||
      lower.includes("gluten-free") ||
      lower.includes("gluten free") ||
      lower.includes("plant-based")
    );
  }

  return true;
}

function buildVenueHref(
  venueSlug: string,
  mode: StandingsMode,
  category: CategoryFilter,
  vendorSlug: string,
  searchQuery: string
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

  const trimmed = searchQuery.trim();
  if (trimmed) {
    params.set("q", trimmed);
  }

  const query = params.toString();
  return `/venues/${venueSlug}${query ? `?${query}` : ""}`;
}

function FilterChips({
  venueSlug,
  mode,
  category,
  vendorSlug,
  searchQuery
}: {
  venueSlug: string;
  mode: StandingsMode;
  category: CategoryFilter;
  vendorSlug: string;
  searchQuery: string;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {categoryOptions.map((option) => (
        <Link
          key={option.value}
          href={buildVenueHref(venueSlug, mode, option.value, vendorSlug, searchQuery)}
          className={`filter-chip rounded-full border px-2.5 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.08em] sm:px-3 sm:text-xs ${
            category === option.value
              ? "filter-chip-active"
              : "filter-chip-inactive border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.75)] text-[var(--slop-cream-muted)]"
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
  vendorSlug,
  searchQuery
}: {
  venueSlug: string;
  mode: StandingsMode;
  category: CategoryFilter;
  vendorSlug: string;
  searchQuery: string;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {modeOptions.map((option) => (
        <Link
          key={option.value}
          href={buildVenueHref(venueSlug, option.value, category, vendorSlug, searchQuery)}
          className={`filter-chip rounded-full border px-3 py-2 text-xs font-black sm:px-4 sm:text-sm ${
            mode === option.value
              ? "filter-chip-active"
              : "filter-chip-inactive border-[var(--slop-line)] bg-[color:rgba(21,42,61,0.85)] text-[var(--slop-cream)]"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
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
  const awardBundles = await Promise.all(
    venueFoodItems.map(async (item) => ({
      item,
      season: await getDbBackedItemSlopStats(venue.slug, item.slug, "season"),
      fresh: await getDbBackedItemSlopStats(
        venue.slug,
        item.slug,
        "gameDayFresh"
      )
    }))
  );
  const awardBoards = buildVenueAwardBoards(awardBundles);
  const mode = getMode(query?.mode);
  const category = getCategory(query?.category);
  const rawVendorSlug = (query?.vendor ?? "all").trim() || "all";
  const vendorSlug =
    rawVendorSlug !== "all" && !venueVendors.some((v) => v.slug === rawVendorSlug)
      ? "all"
      : rawVendorSlug;
  const searchQuery = (query?.q ?? "").trim();
  const selectedVendor = venueVendors.find((vendor) => vendor.slug === vendorSlug);
  const statsMode: SlopStatsMode =
    mode === "fresh" ? "gameDayFresh" : mode === "season" ? "season" : "allTime";
  const filteredItems = venueFoodItems.filter(
    (item) =>
      itemPassesCategory(item, category) &&
      (vendorSlug === "all" || item.vendorSlug === vendorSlug)
  );
  const itemStats = await Promise.all(
    filteredItems.map(async (item) => ({
      item,
      stats: await getDbBackedItemSlopStats(venue.slug, item.slug, statsMode)
    }))
  );
  const vendorBySlug = new Map(venueVendors.map((v) => [v.slug, v] as const));
  const sortedItemStats = itemStats.sort((a, b) => {
    const ar = a.stats.reviewCount > 0 ? 1 : 0;
    const br = b.stats.reviewCount > 0 ? 1 : 0;
    if (br !== ar) {
      return br - ar;
    }
    if (b.stats.averageSlopScore !== a.stats.averageSlopScore) {
      return b.stats.averageSlopScore - a.stats.averageSlopScore;
    }

    if (b.stats.reviewCount !== a.stats.reviewCount) {
      return b.stats.reviewCount - a.stats.reviewCount;
    }

    return a.item.name.localeCompare(b.item.name);
  });

  let standingsRows = sortedItemStats;
  if (category === "reviewed") {
    standingsRows = standingsRows.filter(({ stats }) => stats.reviewCount > 0);
  }
  const beforeSearchCount = standingsRows.length;
  standingsRows = standingsRows.filter(({ item }) =>
    itemMatchesVenueSearch(
      item,
      vendorBySlug.get(item.vendorSlug),
      searchQuery
    )
  );

  const emptyStandingsMessage =
    standingsRows.length > 0
      ? null
      : searchQuery
        ? beforeSearchCount > 0
          ? `No items match "${searchQuery}". Try fewer keywords or clear search.`
          : category === "reviewed"
            ? "No reviewed items in this view yet. Try another mode or category, or be the first to submit a review."
            : "No items match these filters."
        : category === "reviewed"
          ? "No reviewed items in this view yet. Switch to All or another category, or leave the first review."
          : "No items match these filters.";
  const maxReviewsInList = standingsRows.reduce(
    (max, { stats }) => Math.max(max, stats.reviewCount),
    0
  );
  const standingsAgeGateRows = standingsRows.map(({ item, stats }) => {
    const vendor = vendorBySlug.get(item.vendorSlug);
    return {
      item,
      stats,
      vendor,
      alcoholRelated: isAlcoholRelatedFoodItem(item, vendor)
    };
  });
  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-4 pb-6 pt-3 sm:px-6 sm:pb-8 sm:pt-4 lg:px-10">
        <Link
          href="/venues"
          className="inline-flex text-xs font-bold text-[var(--slop-cream-dim)] hover:text-[var(--slop-cream)] sm:text-sm"
        >
          ← Venues
        </Link>

        <header className="border-b border-[var(--slop-line-strong)] pb-3 pt-2 sm:pb-4">
          <h1 className="text-2xl font-black leading-tight tracking-tight text-[var(--slop-cream)] sm:text-4xl">
            {venue.name}
          </h1>
          <p className="mt-1.5 text-xs text-[var(--slop-cream-muted)] sm:text-sm">
            <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span>
                {venue.city}, {venue.state}
              </span>
              <span className="text-[var(--slop-line)]">·</span>
              <span className="font-semibold text-[var(--slop-cream)]">
                {formatVenueTeamsInline(venue.teams, venue.slug)}
              </span>
              {venue.primarySport || venue.sports[0] ? (
                <>
                  <span className="text-[var(--slop-line)]">·</span>
                  <span>{venue.primarySport ?? venue.sports[0]}</span>
                </>
              ) : null}
            </span>
          </p>
        </header>

        <VenueAwardBoards venueSlug={venue.slug} boards={awardBoards} />

        <section
          className="pt-3 sm:pt-4"
          aria-describedby="venue-standings-hint"
        >
          <p id="venue-standings-hint" className="sr-only">
            Rankings use geofenced fan reviews within {venue.reviewRadiusMeters}{" "}
            meters of this venue when submitted on site.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
              Rankings
            </p>
            <FanPoweredGuideBadge />
          </div>
          <FanPoweredGuideNote preset="venue-rankings" className="mt-2" />
          <ModeChips
            venueSlug={venue.slug}
            mode={mode}
            category={category}
            vendorSlug={vendorSlug}
            searchQuery={searchQuery}
          />
          <FilterChips
            venueSlug={venue.slug}
            mode={mode}
            category={category}
            vendorSlug={vendorSlug}
            searchQuery={searchQuery}
          />
          <form
            method="get"
            action={`/venues/${venue.slug}`}
            className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
          >
            {mode !== "season" ? (
              <input type="hidden" name="mode" value={mode} />
            ) : null}
            {category !== "all" ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            {vendorSlug !== "all" ? (
              <input type="hidden" name="vendor" value={vendorSlug} />
            ) : null}
            <label className="block min-w-0 flex-1 sm:max-w-md">
              <span className="sr-only">Search items in this venue</span>
              <input
                name="q"
                type="search"
                enterKeyHint="search"
                defaultValue={searchQuery}
                placeholder="Item, vendor, section…"
                className="mt-0.5 w-full rounded-lg border border-[color:rgba(245,233,208,0.1)] bg-[color:rgba(11,27,43,0.45)] px-2.5 py-1.5 text-xs font-medium text-[var(--slop-cream)] outline-none placeholder:text-[var(--slop-cream-dim)] focus:border-[var(--slop-orange)] focus:ring-1 focus:ring-[var(--slop-gold)]/30 sm:px-3 sm:text-sm"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-full border border-[color:rgba(245,233,208,0.12)] bg-[color:rgba(21,42,61,0.5)] px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)]/50 hover:text-[var(--slop-cream)] active:scale-[0.98]"
              >
                Search
              </button>
              {searchQuery ? (
                <Link
                  href={buildVenueHref(venue.slug, mode, category, vendorSlug, "")}
                  className="inline-flex items-center rounded-full border border-transparent px-3 py-1.5 text-[0.65rem] font-bold text-[var(--slop-cream-dim)] underline-offset-2 hover:text-[var(--slop-gold-bright)] hover:underline active:scale-[0.98]"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
          <VenueVendorSelect
            venueSlug={venue.slug}
            mode={mode}
            category={category}
            vendorSlug={vendorSlug}
            vendors={venueVendors}
            q={searchQuery}
          />
          {selectedVendor ? (
            <Link
              href={`/venues/${venue.slug}/vendors/${selectedVendor.slug}`}
              className="mt-1.5 inline-flex text-xs font-bold text-[var(--slop-cream-dim)] hover:text-[var(--slop-cream)]"
            >
              Vendor: {selectedVendor.name} →
            </Link>
          ) : null}

          <div className="mt-3 overflow-hidden rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.35)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_28px_rgba(0,0,0,0.35)] sm:rounded-2xl">
            <AgeGateProvider>
              {standingsRows.length > 0 ? (
                <VenueStandingsAgeGate
                  rows={standingsAgeGateRows}
                  venueSlug={venue.slug}
                  isFreshStandingsTab={mode === "fresh"}
                  maxReviewsInList={maxReviewsInList}
                />
              ) : (
                <p className="px-3 py-4 text-sm leading-snug text-[var(--slop-cream-muted)] sm:px-4">
                  {emptyStandingsMessage}
                </p>
              )}
            </AgeGateProvider>
          </div>
          <FanPoweredGuideNote preset="venue-bottom" className="mt-2.5 px-0.5" />
          <SuggestCorrectionLink
            className="mt-2 px-0.5"
            context={{
              kind: "venue",
              venueName: venue.name,
              venueSlug: venue.slug,
              pagePath: `/venues/${venue.slug}`
            }}
          />
        </section>

        <section className="border-t border-[var(--slop-line-strong)] py-4 sm:py-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--slop-gold-dim)]">
              Stands
            </h2>
          </div>

          <div className="mt-2 grid gap-1.5 sm:gap-2">
            {venueVendors.map((vendor) => {
              const vendorItems = venueFoodItems.filter(
                (item) => item.vendorSlug === vendor.slug
              );

              return (
                <Link
                  key={vendor.slug}
                  href={`/venues/${venue.slug}/vendors/${vendor.slug}`}
                  className="brand-card rounded-2xl p-4 transition hover:border-[color:rgba(244,179,33,0.45)]"
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

          <article className="brand-card mt-3 rounded-2xl p-3 sm:mt-4 sm:rounded-3xl sm:p-4">
            <h3 className="text-sm font-black text-[var(--slop-cream)]">
              Suggest a menu item
            </h3>
            {isSignedIn ? (
              <form action={suggestMissingItem} className="mt-2 grid gap-2">
                <input type="hidden" name="venueSlug" value={venue.slug} />
                <input
                  name="itemName"
                  required
                  placeholder="Missing item name"
                  className="rounded-2xl border border-[var(--slop-line-strong)] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
                />
                <select
                  name="vendorSlug"
                  className="rounded-2xl border border-[var(--slop-line-strong)] bg-black px-4 py-3 text-sm text-white outline-none"
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
                  className="rounded-2xl border border-[var(--slop-line-strong)] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
                />
                <textarea
                  name="suggestedItemNote"
                  maxLength={240}
                  placeholder="Optional: price, stand, or menu context"
                  className="min-h-20 rounded-2xl border border-[var(--slop-line-strong)] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
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
                className="mt-2 inline-flex rounded-full border border-[var(--slop-line-strong)] px-4 py-2 text-xs font-bold text-[var(--slop-cream-dim)]"
              >
                Sign in to suggest
              </Link>
            )}
          </article>

          <ClaimListingCta
            className="mt-3 sm:mt-4"
            context={{
              kind: "venue",
              venueName: venue.name,
              venueSlug: venue.slug,
              pagePath: `/venues/${venue.slug}`
            }}
          />
        </section>

      </section>
    </main>
  );
}
