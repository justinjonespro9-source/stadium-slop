import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getFoodItemsByVendorSlug,
  getVendorBySlug,
  getVenueBySlug
} from "@/lib/sample-data";

type VendorPageProps = {
  params: Promise<{
    venueSlug: string;
    vendorSlug: string;
  }>;
};

function formatSections(item: ReturnType<typeof getFoodItemsByVendorSlug>[number]) {
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
  const venue = getVenueBySlug(venueSlug);
  const vendor = getVendorBySlug(vendorSlug);

  if (!venue || !vendor || vendor.venueSlug !== venue.slug) {
    notFound();
  }

  const vendorItems = getFoodItemsByVendorSlug(vendor.slug).sort(
    (a, b) => b.slopScore - a.slopScore
  );

  return (
    <main className="min-h-screen bg-[#111111] text-white">
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
            <p className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-zinc-400">
              {vendor.lineIntel}
            </p>
          ) : null}
        </header>

        <section className="border-t border-zinc-800 py-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Items at this stand
          </p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
            {vendorItems.map((item, index) => (
              <Link
                key={item.slug}
                href={`/venues/${venue.slug}/${item.slug}`}
                className="block border-b border-zinc-800 px-4 py-4 transition last:border-b-0 hover:bg-black"
              >
                <article className="grid grid-cols-[auto_1fr_auto] gap-3">
                  <span className="pt-1 text-sm font-black text-zinc-500">
                    #{index + 1}
                  </span>
                  <div>
                    <h2 className="font-black">{item.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {item.itemType} · {formatSections(item)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span>{item.reviewCount} reviews</span>
                      <span>{item.napkinRating}/5 napkins</span>
                      {item.reportedPrice ? (
                        <span>${item.reportedPrice.toFixed(2)}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">
                      {item.slopScore.toFixed(1)}
                    </p>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-600">
                      Slop
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
