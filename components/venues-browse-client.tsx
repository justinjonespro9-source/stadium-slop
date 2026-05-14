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
      <div className="mb-8 rounded-2xl border border-[var(--slop-line-strong)] bg-[color:rgba(245,233,208,0.04)] p-3 sm:p-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
            Search venues
          </span>
          <input
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, city, team, league, sport, type, signature event…"
            className="mt-2 w-full rounded-xl border border-[var(--slop-line-strong)] bg-[var(--slop-navy-deep)] px-4 py-3 text-base text-white outline-none ring-[var(--slop-gold)] placeholder:text-zinc-600 focus-visible:ring-2"
          />
        </label>
      </div>

      {showEmpty ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-8 text-center text-sm leading-6 text-zinc-400">
          {VENUE_SEARCH_EMPTY_MESSAGE}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {filtered.map((venue) => {
            const venueFoodItems = itemsByVenueSlug[venue.slug] ?? [];
            const topItem = [...venueFoodItems].sort(
              (a, b) => b.slopScore - a.slopScore
            )[0];

            return (
              <Link
                key={venue.slug}
                href={`/venues/${venue.slug}`}
                className="brand-card group rounded-3xl border p-6 transition hover:border-[var(--slop-gold)]"
              >
                <article>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black">{venue.name}</h2>
                      <p className="mt-2 text-sm text-zinc-400">
                        {venue.city}, {venue.state}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400"
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

                  <p className="mt-5 text-sm text-zinc-500">
                    {venue.teams.join(", ")}
                  </p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                    {venue.leagues.join(", ")}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {venue.sports.join(", ")}
                  </p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-zinc-600">
                    {venue.reviewRadiusMeters}m verified review zone
                  </p>

                  <div className="mt-6 rounded-2xl border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.65)] p-4">
                    <p className="text-sm text-zinc-500">
                      {venueFoodItems.length}{" "}
                      {venueFoodItems.length === 1 ? "item" : "items"}
                    </p>
                    <p className="mt-3 text-sm text-zinc-500">Top item</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
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
                      <p className="mt-1 text-sm text-zinc-500">
                        {topItem.itemType} · Slop Score{" "}
                        {topItem.slopScore.toFixed(1)} · {topItem.verdict}
                      </p>
                    ) : null}
                  </div>

                  <p className="mt-5 text-sm font-bold text-[var(--slop-gold)] transition group-hover:text-[var(--slop-gold-bright)]">
                    View venue
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
