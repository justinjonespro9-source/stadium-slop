"use client";

import Link from "next/link";
import { useMemo, useState, type KeyboardEvent } from "react";

import type { FoodItem } from "@/lib/sample-data";
import type { Venue } from "@/lib/sample-data";
import { VenueSearchEmpty } from "@/components/venue-search-empty";
import { venueTypeGlyph } from "@/lib/venue-display";
import { filterVenuesBySearch } from "@/lib/venue-search";

type VenuesBrowseClientProps = {
  venues: Venue[];
  itemsByVenueSlug: Record<string, FoodItem[]>;
};

export function VenuesBrowseClient({
  venues,
  itemsByVenueSlug
}: VenuesBrowseClientProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => filterVenuesBySearch(venues, query),
    [venues, query]
  );
  const showEmpty = query.trim().length > 0 && filtered.length === 0;

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Escape") {
      return;
    }
    e.preventDefault();
    setQuery("");
  };

  const countVisible = venues.length === 1 ? "venue" : "venues";

  return (
    <>
      <header className="mb-3 sm:mb-4">
        <h1 className="text-xl font-black tracking-tight text-[var(--slop-cream)] sm:text-2xl lg:text-3xl">
          Venues
        </h1>
        <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-gold-dim)] sm:text-[0.72rem]">
          Showing{" "}
          <span className="tabular-nums text-[var(--slop-cream-muted)]">{filtered.length}</span>{" "}
          of{" "}
          <span className="tabular-nums text-[var(--slop-cream-muted)]">{venues.length}</span>{" "}
          {countVisible}
          {query.trim() ? (
            <>
              {" "}
              <span aria-hidden className="text-[var(--slop-line)]">
                ·
              </span>{" "}
              matched
            </>
          ) : null}
        </p>
      </header>

      <div className="brand-panel mb-3 rounded-xl border border-[var(--slop-line-strong)] p-1.5 shadow-lg sm:mb-4 sm:rounded-2xl sm:p-2">
        <label className="block">
          <span className="sr-only">Search venues</span>
          <input
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Stadium, city, team, league…"
            className="w-full rounded-xl border border-[var(--slop-line-strong)] bg-[var(--slop-navy-deep)] px-3 py-2.5 text-[0.95rem] font-semibold text-[var(--slop-cream)] outline-none ring-[var(--slop-gold)] placeholder:text-[var(--slop-cream-dim)] focus-visible:ring-2 sm:rounded-[1.25rem] sm:px-4 sm:py-3 sm:text-base"
          />
        </label>
      </div>

      {showEmpty ? (
        <VenueSearchEmpty className="mb-4 border-[var(--slop-line-strong)]" />
      ) : (
        <div className="grid gap-2.5 sm:gap-3 md:grid-cols-3">
          {filtered.map((venue) => {
            const venueFoodItems = itemsByVenueSlug[venue.slug] ?? [];
            const topItem = [...venueFoodItems].sort(
              (a, b) => b.slopScore - a.slopScore
            )[0];
            const vendorCount = new Set(venueFoodItems.map((item) => item.vendorSlug)).size;

            return (
              <Link
                key={venue.slug}
                href={`/venues/${venue.slug}`}
                className="brand-card group rounded-xl border border-[var(--slop-line-strong)] p-3.5 transition hover:border-[var(--slop-gold)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] sm:rounded-2xl sm:p-4"
              >
                <article>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-[1.05rem] font-black leading-tight tracking-tight text-[var(--slop-cream)] sm:text-lg">
                        {venue.name}
                      </h2>
                      <p className="mt-1 text-[0.7rem] text-[var(--slop-cream-dim)] sm:text-xs">
                        {venue.city}, {venue.state}
                      </p>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.65)] px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.09em] text-[var(--slop-gold-dim)]"
                      title={venue.venueType}
                    >
                      {venue.venueTypeKey ? (
                        <span
                          className="text-sm leading-none opacity-85"
                          aria-hidden
                        >
                          {venueTypeGlyph(venue.venueTypeKey) ?? ""}
                        </span>
                      ) : null}
                      <span>{venue.venueType}</span>
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-[0.72rem] font-semibold text-[var(--slop-cream-muted)] sm:text-xs">
                    {venue.teams.length > 0 ? venue.teams.join(" · ") : "—"}
                  </p>

                  <div className="mt-2.5 rounded-lg border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.55)] px-2.5 py-2 sm:px-3 sm:py-2.5">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]">
                      <span className="tabular-nums text-[var(--slop-cream-muted)]">
                        {venueFoodItems.length}
                      </span>{" "}
                      {venueFoodItems.length === 1 ? "item" : "items"}
                      {venueFoodItems.length > 0 ? (
                        <>
                          <span className="text-[var(--slop-line)]"> · </span>
                          <span className="tabular-nums text-[var(--slop-cream-muted)]">
                            {vendorCount}
                          </span>{" "}
                          {vendorCount === 1 ? "vendor" : "vendors"}
                        </>
                      ) : null}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-bold text-[var(--slop-cream)]">
                        {topItem ? topItem.name : "No food items yet"}
                      </p>
                      {topItem?.ageRestricted ? (
                        <span className="rounded-md border border-[var(--slop-line-strong)] px-1.5 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                          21+
                        </span>
                      ) : null}
                      {topItem?.isPromoted ? (
                        <span className="rounded-md border border-[var(--slop-line-strong)] px-1.5 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                          Promoted
                        </span>
                      ) : null}
                      {topItem?.isNewThisSeason ? (
                        <span className="rounded-md border border-[var(--slop-line-strong)] px-1.5 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
                          New
                        </span>
                      ) : null}
                    </div>
                    {topItem ? (
                      <p className="mt-1 text-[0.65rem] text-[var(--slop-cream-dim)] sm:text-xs">
                        {topItem.itemType} · {topItem.slopScore.toFixed(1)} Slop
                      </p>
                    ) : null}
                  </div>

                  <p className="mt-2.5 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--slop-gold)] transition group-hover:text-[var(--slop-gold-bright)] sm:text-xs">
                    View venue →
                  </p>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
