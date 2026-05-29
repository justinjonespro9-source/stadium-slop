/**
 * Vendor / stand detail — /venues/[venueSlug]/vendors/[vendorSlug]
 * TODO: "More from this vendor" module on item pages, vendor-specific claim flow.
 */
import Link from "next/link";
import { notFound } from "next/navigation";

import { DiscoveryPageHero } from "@/components/discovery/discovery-page-hero";
import { type FoodItem } from "@/lib/sample-data";
import {
  getPublicFoodItemsByVendorSlug,
  getPublicVendorBySlug,
  getPublicVenueBySlug
} from "@/lib/public-data";
import { isNapkinEligibleItem } from "@/lib/item-eligibility";
import {
  getVenueItemSlopStatsMap,
  resolveVenueItemSlopStats,
  getSlopScoreTier
} from "@/lib/slop-stats";
import { isUnratedItemStats } from "@/components/food-item-empty-states";
import { withPublicRouteTiming } from "@/lib/route-timing";

type VendorPageProps = {
  params: Promise<{
    venueSlug: string;
    vendorSlug: string;
  }>;
};

function formatSections(item: FoodItem) {
  if (!item.sections || item.sections.length === 0) {
    return item.location;
  }

  if (item.sections.length > 2) {
    return "Multiple sections";
  }

  return `Sections ${item.sections.join(", ")}`;
}

export const revalidate = 180;

export default async function VendorPage({ params }: VendorPageProps) {
  return withPublicRouteTiming("vendor-page", async () => {
    const { venueSlug, vendorSlug } = await params;
  const venue = await getPublicVenueBySlug(venueSlug);
  const vendor = await getPublicVendorBySlug(venueSlug, vendorSlug);

  if (!venue || !vendor || vendor.venueSlug !== venue.slug) {
    notFound();
  }

  const venueHref = `/venues/${venue.slug}`;
  const vendorItemsRaw = await getPublicFoodItemsByVendorSlug(venue.slug, vendor.slug);
  const venueStatsMap = await getVenueItemSlopStatsMap(venue.slug);
  const vendorItems = vendorItemsRaw.map((item) => ({
    item,
    stats: resolveVenueItemSlopStats(venueStatsMap, item.slug, "season")
  }));
  vendorItems.sort((a, b) => {
    const ar = a.stats.reviewCount > 0 ? 1 : 0;
    const br = b.stats.reviewCount > 0 ? 1 : 0;
    if (br !== ar) {
      return br - ar;
    }
    if (b.stats.averageSlopScore !== a.stats.averageSlopScore) {
      return b.stats.averageSlopScore - a.stats.averageSlopScore;
    }
    return a.item.name.localeCompare(b.item.name);
  });

  return (
    <main className="media-page-shell min-h-screen">
      <DiscoveryPageHero
        backHref={venueHref}
        backLabel={venue.name}
        eyebrow="Vendor"
        title={vendor.name}
        subtitle={
          <>
            {venue.name} · {vendor.section} · {vendor.location}
          </>
        }
        description={
          vendor.lineIntel ? (
            <span className="block rounded-lg border border-[var(--media-border)] bg-[var(--media-surface)] px-3 py-2 text-[var(--media-ink-muted)]">
              {vendor.lineIntel}
            </span>
          ) : undefined
        }
      />

      <div className="media-discovery-content max-w-4xl">
        <section>
          <div className="media-section-heading">
            <h2 className="media-section-title">Vendor lineup</h2>
            <p className="text-sm font-bold tabular-nums text-[var(--media-ink-dim)]">
              {vendorItems.length} {vendorItems.length === 1 ? "item" : "items"}
            </p>
          </div>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {vendorItems.map(({ item, stats }, index) => {
              const napkinEligible = isNapkinEligibleItem(item);
              const unrated = isUnratedItemStats(stats.reviewCount);
              const showTopBadge = index === 0 && !unrated;

              return (
                <li key={item.slug}>
                  <Link
                    href={`/venues/${venue.slug}/${item.slug}`}
                    className="media-card block"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="media-venue-rank text-[var(--media-ink-dim)]">
                            #{index + 1}
                          </span>
                          {showTopBadge ? (
                            <span className="rounded-full border border-[rgba(255,107,26,0.35)] bg-[rgba(255,107,26,0.08)] px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[var(--media-orange-deep)]">
                              Top performer
                            </span>
                          ) : null}
                        </div>
                        <h3 className="media-rank-card-title mt-1">{item.name}</h3>
                        <p className="media-rank-card-meta">
                          {item.itemType} · {formatSections(item)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[0.7rem] text-[var(--media-ink-dim)]">
                          <span>
                            {stats.reviewCount > 0
                              ? `${stats.reviewCount} reviews`
                              : "Unrated"}
                          </span>
                          {napkinEligible && stats.reviewCount > 0 ? (
                            <span>{stats.roundedNapkinRating}/5 napkins</span>
                          ) : null}
                          {item.reportedPrice ? (
                            <span>${item.reportedPrice.toFixed(2)}</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {unrated ? (
                          <>
                            <p className="media-venue-score text-[var(--media-ink-dim)]">—</p>
                            <p className="mt-0.5 text-[0.55rem] font-bold uppercase text-[var(--media-ink-dim)]">
                              Unrated
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="media-venue-score">{stats.averageSlopScore.toFixed(1)}</p>
                            <p className="mt-0.5 text-[0.55rem] font-bold uppercase text-[var(--media-ink-dim)]">
                              {getSlopScoreTier(stats.averageSlopScore)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
  });
}
