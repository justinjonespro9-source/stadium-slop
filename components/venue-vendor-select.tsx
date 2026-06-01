"use client";

import { useRouter } from "next/navigation";
import type { Vendor } from "@/lib/sample-data";

import type { VenueItemCategoryFilter } from "@/lib/venue-item-filters";

type StandingsMode = "all-time" | "season" | "fresh";

type CategoryFilter = VenueItemCategoryFilter;

function buildQuery(
  venueSlug: string,
  mode: StandingsMode,
  category: CategoryFilter,
  vendorSlug: string,
  q: string
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
  const trimmed = q.trim();
  if (trimmed) {
    params.set("q", trimmed);
  }
  const qs = params.toString();
  return `/venues/${venueSlug}${qs ? `?${qs}` : ""}`;
}

export function VenueVendorSelect({
  venueSlug,
  mode,
  category,
  vendorSlug,
  vendors,
  q,
  tone = "brand"
}: {
  venueSlug: string;
  mode: StandingsMode;
  category: CategoryFilter;
  vendorSlug: string;
  vendors: Vendor[];
  q: string;
  tone?: "brand" | "media";
}) {
  const router = useRouter();
  const selectClass =
    tone === "media"
      ? "media-venue-vendor-select mt-0 w-full max-w-md"
      : "mt-0 w-full max-w-md rounded-xl border border-[var(--slop-line)] bg-black px-3 py-2 text-sm font-bold text-[var(--slop-cream)] outline-none focus:border-[var(--slop-orange)]";

  return (
    <label className="block max-w-full">
      <span className="sr-only">Vendor filter</span>
      <select
        className={selectClass}
        value={vendorSlug === "all" ? "all" : vendorSlug}
        aria-label="Filter by vendor"
        onChange={(e) => {
          const next = e.target.value;
          router.push(buildQuery(venueSlug, mode, category, next, q));
        }}
      >
        <option value="all">All vendors</option>
        {vendors.map((v) => (
          <option key={v.slug} value={v.slug}>
            {v.name}
          </option>
        ))}
      </select>
    </label>
  );
}
