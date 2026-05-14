"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Venue } from "@/lib/sample-data";
import {
  filterVenuesBySearch,
  VENUE_SEARCH_EMPTY_MESSAGE
} from "@/lib/venue-search";

type HomeVenueSearchProps = {
  venues: Venue[];
};

export function HomeVenueSearch({ venues }: HomeVenueSearchProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => filterVenuesBySearch(venues, query),
    [venues, query]
  );
  const showEmpty = query.trim().length > 0 && filtered.length === 0;

  return (
    <div className="brand-panel mt-3 rounded-[2rem] border p-2 shadow-2xl">
      <label className="block px-1 pt-1">
        <span className="sr-only">Search venues</span>
        <input
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Venue, city, team, league, sport, or type…"
          className="w-full rounded-[1.5rem] border border-[var(--slop-line-strong)] bg-[var(--slop-navy-deep)] px-5 py-5 text-base font-semibold text-[var(--slop-cream)] outline-none ring-[var(--slop-gold)] placeholder:text-[var(--slop-cream-dim)] focus-visible:ring-2 sm:text-lg"
        />
      </label>
      {showEmpty ? (
        <p className="border-t border-[var(--slop-line)] px-4 py-4 text-center text-sm text-[color:rgba(255,244,223,0.62)]">
          {VENUE_SEARCH_EMPTY_MESSAGE}
        </p>
      ) : null}
      {!showEmpty && query.trim().length > 0 ? (
        <ul className="max-h-64 overflow-y-auto border-t border-[var(--slop-line)] px-2 py-2">
          {filtered.map((venue) => (
            <li key={venue.slug}>
              <Link
                href={`/venues/${venue.slug}`}
                className="flex flex-col gap-0.5 rounded-xl px-3 py-3 text-left text-sm transition hover:bg-[color:rgba(255,244,223,0.06)]"
              >
                <span className="font-black text-[var(--slop-cream)]">
                  {venue.name}
                </span>
                <span className="text-xs text-[color:rgba(255,244,223,0.55)]">
                  {venue.city}, {venue.state} · {venue.venueType}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="border-t border-[var(--slop-line)] px-4 py-2 text-center text-xs text-[color:rgba(255,244,223,0.45)]">
        <Link
          href="/venues"
          className="font-bold text-[var(--slop-gold)] underline-offset-2 hover:underline"
        >
          Browse all venues
        </Link>
      </p>
    </div>
  );
}
