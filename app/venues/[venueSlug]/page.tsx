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
  getVenueItemSlopStatsMap,
  resolveVenueItemSlopStats,
  type SlopStatsMode
} from "@/lib/slop-stats";
import { prisma } from "@/lib/prisma";
import {
  getContributorUserId,
  requireContributorUserId
} from "@/lib/auth/contributor-id";
import { FairPreviewNotice } from "@/components/venue/fair-preview-notice";
import { FairVenueGuideStatus } from "@/components/venue/fair-venue-guide-status";
import { FairVenueStandings } from "@/components/venue/fair-venue-standings";
import { VenueHero } from "@/components/venue/venue-hero";
import {
  VenuePartnerCard,
  VenuePartnerHeroBadge
} from "@/components/venue/venue-partner-card";
import { VenueVendorSelect } from "@/components/venue-vendor-select";
import { itemMatchesVenueSearch } from "@/lib/venue-standings-search";
import { getAbsoluteUrl, SITE_TAGLINE_SHORT } from "@/lib/site-metadata";
import { formatHomeOfTeams, formatVenueTeamsInline } from "@/lib/venue-teams";
import { AdSlot } from "@/components/ads/ad-slot";
import { ClaimListingCta } from "@/components/claim-listing-cta";
import { VenueSuggestMenuItem } from "@/components/venue/venue-suggest-menu-item";
import { SuggestCorrectionLink } from "@/components/suggest-correction-link";
import {
  FanPoweredGuideBadge,
  FanPoweredGuideNote
} from "@/components/fan-powered-guide-note";
import { AgeGateProvider } from "@/components/age-gate/age-gate-context";
import { VenueStandingsAgeGate } from "@/components/age-gate/venue-standings-age-gate";
import { isAlcoholRelatedFoodItem } from "@/lib/alcohol-content";
import {
  computeVenueFanFavoriteBadges,
  getFanFavoriteBadgesForItem
} from "@/lib/venue-awards";
import { GameDayModeCard } from "@/components/game-day-mode-card";
import { VenueFreshFeed } from "@/components/venue-fresh-feed";
import {
  getVenueActiveGame,
  getVenueTimeZone,
  getVenueUpcomingGame
} from "@/lib/game-day";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getVenueFreshFeedReviews } from "@/lib/venue-fresh-feed";
import { withPublicRouteTiming } from "@/lib/route-timing";
import { getFairVenueGuideStatusLine } from "@/lib/fair-venue-guide-status";
import { isFairVenueSlug } from "@/lib/fair-preview";
import {
  FAIR_VENUE_MENU_EYEBROW,
  FAIR_VENUE_MENU_HEADING,
  FAIR_VENUE_MENU_SUBCOPY,
  getStandingsModeOptions,
  getVenuePageDescription
} from "@/lib/venue-copy-context";
import {
  canonicalVenuePath,
  resolveCanonicalPublicVenueSlug
} from "@/lib/venue-public-slug";

import {
  itemPassesVenueCategoryFilter,
  parseVenueItemCategoryFilter,
  VENUE_ITEM_CATEGORY_OPTIONS,
  type VenueItemCategoryFilter
} from "@/lib/venue-item-filters";
import { venuePartnerFromVenue, venueShareContextFromPartner } from "@/lib/venue-partner";
import { isVenuePartnerPlacementEnabled } from "@/lib/feature-flags";

type StandingsMode = "all-time" | "season" | "fresh";
type CategoryFilter = VenueItemCategoryFilter;
const categoryOptions = VENUE_ITEM_CATEGORY_OPTIONS;

export const revalidate = 180;

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
  const canonicalSlug = resolveCanonicalPublicVenueSlug(venueSlug);
  const venue = await getPublicVenueBySlug(canonicalSlug);

  if (!venue) {
    return {
      title: "Venue",
      description: SITE_TAGLINE_SHORT,
      robots: { index: false, follow: true }
    };
  }

  const homeOfTeams = formatHomeOfTeams(venue.teams, venue.slug);
  const description = [
    getVenuePageDescription(venue.slug, venue.name, venue.city, venue.state),
    !isFairVenueSlug(venue.slug) && homeOfTeams ? `Home of ${homeOfTeams}.` : null,
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
      title: `${venue.name} · Slop Scoreboard`,
      description
    },
    twitter: {
      card: "summary_large_image",
      title: `${venue.name} · Slop Scoreboard`,
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
  const userId = await requireContributorUserId(venuePath);
  const rateLimit = await enforceRateLimit("suggest-item", { userId });
  if (!rateLimit.ok) {
    redirect(`${venuePath}?suggestion=rate-limit`);
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
  await prisma.suggestedItem.create({
    data: {
      venueId: venue.id,
      vendorId: vendor?.id,
      userId,
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
  return parseVenueItemCategoryFilter(value);
}

function itemPassesCategory(item: FoodItem, category: CategoryFilter) {
  return itemPassesVenueCategoryFilter(item, category);
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
          className={`media-hero-pill sm:px-3 sm:text-xs ${
            category === option.value ? "media-hero-pill--active" : ""
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
      {getStandingsModeOptions(venueSlug).map((option) => (
        <Link
          key={option.value}
          href={buildVenueHref(venueSlug, option.value, category, vendorSlug, searchQuery)}
          className={`media-hero-pill px-3 py-2 text-xs sm:px-4 sm:text-sm ${
            mode === option.value ? "media-hero-pill--active" : ""
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}


export default async function VenuePage({ params, searchParams }: VenuePageProps) {
  return withPublicRouteTiming("venue-page", async () => {
    const { venueSlug } = await params;
    const canonicalSlug = resolveCanonicalPublicVenueSlug(venueSlug);
    if (canonicalSlug.toLowerCase() !== venueSlug.trim().toLowerCase()) {
      const query = await searchParams;
      const qs = new URLSearchParams();
      if (query?.mode) qs.set("mode", query.mode);
      if (query?.category) qs.set("category", query.category);
      if (query?.vendor) qs.set("vendor", query.vendor);
      if (query?.q) qs.set("q", query.q);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      redirect(`${canonicalVenuePath(canonicalSlug)}${suffix}`);
    }
    const query = await searchParams;
  const venue = await getPublicVenueBySlug(canonicalSlug);

  if (!venue) {
    notFound();
  }

  const dbVenue = await prisma.venue.findUnique({
    where: { slug: venue.slug },
    select: { id: true, teams: true }
  });
  const venueId = dbVenue?.id;
  let activeGame: Awaited<ReturnType<typeof getVenueActiveGame>> = null;
  let upcomingGame: Awaited<ReturnType<typeof getVenueUpcomingGame>> = null;
  if (venueId) {
    try {
      [activeGame, upcomingGame] = await Promise.all([
        getVenueActiveGame(venueId),
        getVenueUpcomingGame(venueId)
      ]);
    } catch (error) {
      console.warn("Game day schedule lookup failed; continuing without card", error);
    }
  }
  const homeTeamLabel = dbVenue?.teams[0] ?? venue.teams[0] ?? "";
  const venueTimeZone = getVenueTimeZone({
    slug: venue.slug,
    state: venue.state,
    country: venue.country
  });

  const [venueFoodItems, venueVendors, venueFreshReviews, venueStatsMap] =
    await Promise.all([
      getPublicFoodItemsByVenueSlug(venue.slug),
      getPublicVendorsByVenueSlug(venue.slug),
      getVenueFreshFeedReviews(venue.slug),
      getVenueItemSlopStatsMap(venue.slug)
    ]);
  const fanFavoriteEntries = venueFoodItems.map((item) => ({
    itemSlug: item.slug,
    allTime: resolveVenueItemSlopStats(venueStatsMap, item.slug, "allTime"),
    season: resolveVenueItemSlopStats(venueStatsMap, item.slug, "season")
  }));
  const fanFavoriteByItem = computeVenueFanFavoriteBadges(fanFavoriteEntries, venue.slug);
  const fairGuideStatusLine = isFairVenueSlug(venue.slug)
    ? getFairVenueGuideStatusLine(venue.slug, venueFoodItems)
    : null;
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
  const itemStats = filteredItems.map((item) => ({
    item,
    stats: resolveVenueItemSlopStats(venueStatsMap, item.slug, statsMode)
  }));
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
  const standingsAgeGateRows = standingsRows.map(({ item, stats }) => {
    const vendor = vendorBySlug.get(item.vendorSlug);
    return {
      item,
      stats,
      vendor,
      fanFavoriteBadges: getFanFavoriteBadgesForItem(fanFavoriteByItem, item.slug),
      alcoholRelated: isAlcoholRelatedFoodItem(item, vendor)
    };
  });
  const isSignedIn = Boolean(await getContributorUserId());

  const venueMetaLine = (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
      <span>
        {venue.city}, {venue.state}
      </span>
      <span className="text-white/35">·</span>
      <span className="font-semibold text-white/92">
        {formatVenueTeamsInline(venue.teams, venue.slug)}
      </span>
      {venue.primarySport || venue.sports[0] ? (
        <>
          <span className="text-white/35">·</span>
          <span>{venue.primarySport ?? venue.sports[0]}</span>
        </>
      ) : null}
    </span>
  );
  const venuePartner = venuePartnerFromVenue(venue);
  const showVenuePartnerPlacement = isVenuePartnerPlacementEnabled();

  return (
    <main className="media-page-shell min-h-screen">
      <VenueHero
        venueName={venue.name}
        metaLine={venueMetaLine}
        titleBelow={
          showVenuePartnerPlacement ? (
            <VenuePartnerHeroBadge partner={venuePartner} />
          ) : undefined
        }
      >
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
          className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-end"
        >
          {mode !== "season" ? <input type="hidden" name="mode" value={mode} /> : null}
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
              className="media-venue-search-input"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="media-venue-search-btn">
              Search
            </button>
            {searchQuery ? (
              <Link
                href={buildVenueHref(venue.slug, mode, category, vendorSlug, "")}
                className="inline-flex items-center rounded-full px-3 py-2 text-[0.7rem] font-bold text-white/65 underline-offset-2 hover:text-white hover:underline"
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
          tone="media"
        />
        {selectedVendor ? (
          <Link
            href={`/venues/${venue.slug}/vendors/${selectedVendor.slug}`}
            className="inline-flex text-xs font-bold text-white/65 hover:text-white"
          >
            Vendor: {selectedVendor.name} →
          </Link>
        ) : null}
      </VenueHero>

      <div className="media-venue-content">
        {isFairVenueSlug(venue.slug) ? (
          <FairPreviewNotice className="mb-5 sm:mb-6" />
        ) : null}
        {venueId && (activeGame || upcomingGame) ? (
          <GameDayModeCard
            venueHomeTeamLabel={homeTeamLabel}
            venueTimeZone={venueTimeZone}
            activeGame={activeGame}
            upcomingGame={upcomingGame}
          />
        ) : null}

        {showVenuePartnerPlacement ? (
          <VenuePartnerCard
            venueName={venue.name}
            venueSlug={venue.slug}
            partner={venuePartner}
            className="mt-5 lg:hidden"
          />
        ) : null}

        {venueFreshReviews.length > 0 ? (
          <VenueFreshFeed
            reviews={venueFreshReviews}
            venueSlug={venue.slug}
            venueName={venue.name}
            shareContext={venueShareContextFromPartner(venuePartner)}
          />
        ) : null}

        <section
          id="venue-menu"
          className="mt-6 sm:mt-8 scroll-mt-24"
          aria-describedby="venue-standings-hint"
        >
          <p id="venue-standings-hint" className="sr-only">
            Slop Scoreboard uses geofenced fan reviews within {venue.reviewRadiusMeters}{" "}
            meters of this venue when submitted on site.
          </p>
          <div className="media-section-heading">
            <div className="min-w-0">
              {isFairVenueSlug(venue.slug) ? (
                <>
                  <p className="media-section-eyebrow">{FAIR_VENUE_MENU_EYEBROW}</p>
                  <h2 className="media-section-title">{FAIR_VENUE_MENU_HEADING}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.9375rem]">
                    {FAIR_VENUE_MENU_SUBCOPY}
                  </p>
                  {fairGuideStatusLine ? (
                    <FairVenueGuideStatus
                      statusLine={fairGuideStatusLine}
                      className="mt-2.5 max-w-2xl"
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <p className="media-section-eyebrow">Menu rankings</p>
                  <h2 className="media-section-title">Find the best food here</h2>
                </>
              )}
            </div>
            <FanPoweredGuideBadge className="media-guide-badge shrink-0" />
          </div>
          {!isFairVenueSlug(venue.slug) ? (
            <FanPoweredGuideNote preset="venue-rankings" className="media-guide-note mt-2" />
          ) : null}

          <div
            className={
              showVenuePartnerPlacement
                ? "mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-6"
                : "mt-5"
            }
          >
            <div className="min-w-0">
              {isFairVenueSlug(venue.slug) ? (
                <FairVenueStandings
                  rows={standingsAgeGateRows}
                  venueSlug={venue.slug}
                  isFreshStandingsTab={mode === "fresh"}
                  emptyMessage={emptyStandingsMessage}
                  tone="media"
                />
              ) : (
                <AgeGateProvider>
                  {standingsRows.length > 0 ? (
                    <VenueStandingsAgeGate
                      rows={standingsAgeGateRows}
                      venueSlug={venue.slug}
                      isFreshStandingsTab={mode === "fresh"}
                      tone="media"
                    />
                  ) : (
                    <p className="media-panel-card px-4 py-5 text-sm leading-relaxed text-[var(--media-ink-muted)]">
                      {emptyStandingsMessage}
                    </p>
                  )}
                </AgeGateProvider>
              )}

              <AdSlot
                placementKey="rankings.banner"
                variant="banner"
                tone="media"
                className="mt-4 hidden md:block"
              />
              <AdSlot
                placementKey="venue.mobile.inline"
                variant="inline"
                className="mt-4 md:hidden"
              />
            </div>

            {showVenuePartnerPlacement ? (
              <aside className="mt-5 hidden lg:mt-0 lg:block">
                <VenuePartnerCard
                  venueName={venue.name}
                  venueSlug={venue.slug}
                  partner={venuePartner}
                  sticky
                />
              </aside>
            ) : null}
          </div>

          <FanPoweredGuideNote preset="venue-bottom" className="media-guide-note mt-4" />
          <SuggestCorrectionLink
            className="mt-3 text-[var(--media-ink-dim)]"
            context={{
              kind: "venue",
              venueName: venue.name,
              venueSlug: venue.slug,
              pagePath: `/venues/${venue.slug}`
            }}
          />

          <div className="venue-operator-lane mt-6 flex flex-col gap-3 sm:mt-8 md:grid md:grid-cols-2 md:gap-4">
            <VenueSuggestMenuItem
              venueSlug={venue.slug}
              vendors={venueVendors.map((vendor) => ({
                slug: vendor.slug,
                name: vendor.name
              }))}
              isSignedIn={isSignedIn}
              loginHref={`/login?next=${encodeURIComponent(`/venues/${venue.slug}`)}`}
              suggestAction={suggestMissingItem}
            />

            <ClaimListingCta
              desktopClassName="media-panel-card !border-[var(--media-border)] !bg-[var(--media-white)] p-4 sm:p-5 [&_.claim-listing-cta__eyebrow]:text-[var(--media-orange-deep)] [&_.claim-listing-cta__headline]:text-[var(--media-ink)] [&_.claim-listing-cta__subline]:text-[var(--media-ink-muted)] [&_.claim-listing-cta__link]:border-[rgba(255,107,26,0.35)] [&_.claim-listing-cta__link]:bg-[rgba(255,107,26,0.08)] [&_.claim-listing-cta__link]:text-[var(--media-orange-deep)]"
              context={{
                kind: "venue",
                venueName: venue.name,
                venueSlug: venue.slug,
                pagePath: `/venues/${venue.slug}`
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
  });
}
