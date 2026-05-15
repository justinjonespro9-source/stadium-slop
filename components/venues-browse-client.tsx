"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { FoodItem } from "@/lib/sample-data";
import type { Venue } from "@/lib/sample-data";
import { venueTypeGlyph } from "@/lib/venue-display";
import {
  filterVenuesBySearch,
  VENUE_SEARCH_EMPTY_MESSAGE
} from "@/lib/venue-search";

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

  return (
    <>
      <div className="mb-3 rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(245,233,208,0.04)] p-2 sm:mb-4 sm:rounded-2xl sm:p-3">
        <label className="block">
          <span className="sr-only">Search venues</span>
          <input
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Stadium, city, team, league…"
            className="w-full rounded-lg border border-[var(--slop-line-strong)] bg-[var(--slop-navy-deep)] px-3 py-2.5 text-base text-[var(--slop-cream)] outline-none ring-[var(--slop-gold)] placeholder:text-[var(--slop-cream-dim)] focus-visible:ring-2 sm:rounded-xl sm:px-4 sm:py-3"
          />
        </label>
      </div>

      {showEmpty ? (
        <p className="rounded-xl border border-[var(--slop-line-strong)] bg-[var(--slop-surface)] px-3 py-4 text-center text-sm leading-relaxed text-[var(--slop-cream-muted)]">
          {VENUE_SEARCH_EMPTY_MESSAGE}
        </p>
      ) : (
        <div className="grid gap-2.5 sm:gap-3 md:grid-cols-3">
          {filtered.map((venue) => {
            const venueFoodItems = itemsByVenueSlug[venue.slug] ?? [];
            const topItem = [...venueFoodItems].sort(
              (a, b) => b.slopScore - a.slopScore
            )[0];

            return (
              <Link
                key={venue.slug}
                href={`/venues/${venue.slug}`}
                className="brand-card group rounded-2xl border p-4 transition hover:border-[var(--slop-gold)] sm:rounded-3xl sm:p-5"
              >
                <article>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-black leading-tight sm:text-xl">
                        {venue.name}
                      </h2>
                      <p className="mt-1 text-xs text-[var(--slop-cream-dim)] sm:text-sm">
                        {venue.city}, {venue.state}
                      </p>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--slop-line-strong)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-muted)]"
                      title={venue.venueType}
                    >
                      {venue.venueTypeKey ? (
                        <span
                          className="text-base leading-none opacity-85"
                          aria-hidden
                        >
                          {venueTypeGlyph(venue.venueTypeKey) ?? ""}
                        </span>
                      ) : null}
                      <span>{venue.venueType}</span>
                    </span>
                  </div>

                  <p className="mt-2 truncate text-xs text-[var(--slop-cream-dim)] sm:text-sm">
                    {venue.teams.join(", ")}
                  </p>

                  <div className="mt-3 rounded-xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.65)] p-3">
                    <p className="text-xs text-[var(--slop-cream-dim)]">
                      {venueFoodItems.length}{" "}
                      {venueFoodItems.length === 1 ? "item" : "items"}
                      <span className="text-[var(--slop-line)]"> · </span>
                      <span className="font-bold text-[var(--slop-cream-muted)]">
                        Top
                      </span>
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <p className="font-bold">
                        {topItem ? topItem.name : "No food items yet"}
                      </p>
                      {topItem?.ageRestricted ? (
                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                          21+
                        </span>
                      ) : null}
                      {topItem?.isPromoted ? (
                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                          Promoted
                        </span>
                      ) : null}
                      {topItem?.isNewThisSeason ? (
                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                          New This Season
                        </span>
                      ) : null}
                    </div>
                    {topItem ? (
                      <p className="mt-1 text-xs text-[var(--slop-cream-dim)] sm:text-sm">
                        {topItem.itemType} · {topItem.slopScore.toFixed(1)} Slop
                      </p>
                    ) : null}
                  </div>

                  <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--slop-gold)] transition group-hover:text-[var(--slop-gold-bright)] sm:text-sm">
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
