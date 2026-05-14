import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type FoodItem
} from "@/lib/sample-data";
import {
  getPublicFoodItemsByVendorSlug,
  getPublicVendorBySlug,
  getPublicVenueBySlug
} from "@/lib/public-data";
import { isNapkinEligibleItem } from "@/lib/item-eligibility";
import { getDbBackedItemSlopStats, getSlopScoreTier } from "@/lib/slop-stats";
import { isUnratedItemStats } from "@/components/food-item-empty-states";

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

export default async function VendorPage({ params }: VendorPageProps) {
  const { venueSlug, vendorSlug } = await params;
  const venue = await getPublicVenueBySlug(venueSlug);
  const vendor = await getPublicVendorBySlug(venueSlug, vendorSlug);

  if (!venue || !vendor || vendor.venueSlug !== venue.slug) {
    notFound();
  }

  const vendorItems = await Promise.all(
    (await getPublicFoodItemsByVendorSlug(venue.slug, vendor.slug)).map(
      async (item) => ({
        item,
        stats: await getDbBackedItemSlopStats(venue.slug, item.slug, "season")
      })
    )
  );
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
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 lg:px-10">
        <Link
          href={`/venues/${venue.slug}`}
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to {venue.name}
        </Link>

        <header className="py-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Vendor
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {vendor.name}
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            {venue.name} · {vendor.section} · {vendor.location}
          </p>
          {vendor.lineIntel ? (
            <p className="brand-panel mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 text-zinc-400">
              {vendor.lineIntel}
            </p>
          ) : null}
        </header>

        <section className="border-t border-zinc-800 py-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Vendor Lineup
          </p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-[var(--slop-line)] bg-[var(--slop-surface)]">
            {vendorItems.map(({ item, stats }, index) => {
              const napkinEligible = isNapkinEligibleItem(item);
              const unrated = isUnratedItemStats(stats.reviewCount);
              const showTopBadge = index === 0 && !unrated;

              return (
                <Link
                  key={item.slug}
                  href={`/venues/${venue.slug}/${item.slug}`}
                  className="block border-b border-[var(--slop-line)] px-4 py-4 transition last:border-b-0 hover:bg-[var(--slop-ink)]"
                >
                  <article className="grid grid-cols-[auto_1fr_auto] gap-3">
                    <span className="pt-1 text-sm font-black text-zinc-500">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-black">{item.name}</h2>
                        {showTopBadge ? (
                          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-300">
                            Top Performer
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">
                        {item.itemType} · {formatSections(item)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                        <span>
                          {stats.reviewCount > 0
                            ? `${stats.reviewCount} reviews`
                            : "Unrated · awaiting reviews"}
                        </span>
                        {napkinEligible && stats.reviewCount > 0 ? (
                          <span>{stats.roundedNapkinRating}/5 napkins</span>
                        ) : null}
                        {stats.topReplayValue ? (
                          <span>
                            {stats.topReplayValue.percentage}%{" "}
                            {stats.topReplayValue.label}
                          </span>
                        ) : null}
                        {item.reportedPrice ? (
                          <span>${item.reportedPrice.toFixed(2)}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      {unrated ? (
                        <>
                          <p className="text-lg font-black text-zinc-500">—</p>
                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-500">
                            Unrated
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-black text-[var(--slop-orange)]">
                            {stats.averageSlopScore.toFixed(1)}
                          </p>
                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-600">
                            {getSlopScoreTier(stats.averageSlopScore)}
                          </p>
                        </>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
