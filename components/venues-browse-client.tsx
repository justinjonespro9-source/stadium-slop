"use client";

import Link from "next/link";
import { useMemo, useState, type KeyboardEvent } from "react";

import { DiscoveryPageHero } from "@/components/discovery/discovery-page-hero";
import type { FoodItem } from "@/lib/sample-data";
import type { Venue } from "@/lib/sample-data";
import { VenueSearchEmpty } from "@/components/venue-search-empty";
import { venueTypeGlyph } from "@/lib/venue-display";
import { FanPoweredGuideNote } from "@/components/fan-powered-guide-note";
import {
  filterVenuesBySearch,
  VENUE_SEARCH_HELPER_COPY,
  type VenueSearchOptions
} from "@/lib/venue-search";
import { formatVenueTeamsInline } from "@/lib/venue-teams";

type VenuesBrowseClientProps = {
  venues: Venue[];
  itemsByVenueSlug: Record<string, FoodItem[]>;
};

function buildItemTagsByVenueSlug(
  itemsByVenueSlug: Record<string, FoodItem[]>
): VenueSearchOptions["itemTagsByVenueSlug"] {
  const out: Record<string, string[]> = {};
  for (const [slug, items] of Object.entries(itemsByVenueSlug)) {
    const tags = [
      ...new Set(
        items.flatMap((item) => item.tags ?? []).filter((tag) => tag.trim().length > 0)
      )
    ];
    if (tags.length > 0) {
      out[slug] = tags;
    }
  }
  return out;
}

export function VenuesBrowseClient({
  venues,
  itemsByVenueSlug
}: VenuesBrowseClientProps) {
  const [query, setQuery] = useState("");
  const searchOptions = useMemo(
    () => ({ itemTagsByVenueSlug: buildItemTagsByVenueSlug(itemsByVenueSlug) }),
    [itemsByVenueSlug]
  );
  const filtered = useMemo(
    () => filterVenuesBySearch(venues, query, searchOptions),
    [venues, query, searchOptions]
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
  const countLabel =
    venues.length === 1 ? "1 venue on Stadium Slop" : `${venues.length} venues on Stadium Slop`;

  return (
    <>
      <DiscoveryPageHero
        backHref="/"
        backLabel="Home"
        eyebrow="Discover"
        title="Venues"
        subtitle={
          <>
            Showing{" "}
            <span className="tabular-nums text-white">{filtered.length}</span> of{" "}
            <span className="tabular-nums text-white">{venues.length}</span> {countVisible}
            {query.trim() ? (
              <>
                {" "}
                <span aria-hidden className="text-white/40">
                  ·
                </span>{" "}
                matched
              </>
            ) : null}
          </>
        }
        description={countLabel}
      >
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
            className="media-discovery-search w-full"
          />
        </label>
        <p className="mt-2 text-[0.7rem] font-medium text-white/55 sm:text-xs">
          {VENUE_SEARCH_HELPER_COPY}
        </p>
      </DiscoveryPageHero>

      <div className="media-discovery-content">
        <div className="media-discovery-search-panel mb-4 sm:mb-5">
          <FanPoweredGuideNote preset="browse" className="media-guide-note" />
        </div>

        {showEmpty ? (
          <VenueSearchEmpty tone="media" className="mb-4" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((venue) => {
              const venueFoodItems = itemsByVenueSlug[venue.slug] ?? [];
              const topItem = [...venueFoodItems].sort(
                (a, b) => b.slopScore - a.slopScore
              )[0];
              const vendorCount = new Set(venueFoodItems.map((item) => item.vendorSlug)).size;

              return (
                <Link key={venue.slug} href={`/venues/${venue.slug}`} className="media-card block h-full">
                  <article className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="media-rank-card-title">{venue.name}</h2>
                        <p className="media-rank-card-meta">
                          {venue.city}, {venue.state}
                        </p>
                      </div>
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--media-border)] bg-[var(--media-surface)] px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-[var(--media-ink-dim)]"
                        title={venue.venueType}
                      >
                        {venue.venueTypeKey ? (
                          <span className="text-sm leading-none" aria-hidden>
                            {venueTypeGlyph(venue.venueTypeKey) ?? ""}
                          </span>
                        ) : null}
                        <span>{venue.venueType}</span>
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs font-semibold text-[var(--media-ink-muted)]">
                      {venue.teams.length > 0 ? formatVenueTeamsInline(venue.teams) : "—"}
                    </p>

                    <div className="mt-3 flex-1 rounded-lg border border-[var(--media-border)] bg-[var(--media-surface)] px-2.5 py-2">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[var(--media-ink-dim)]">
                        <span className="tabular-nums text-[var(--media-ink-muted)]">
                          {venueFoodItems.length}
                        </span>{" "}
                        {venueFoodItems.length === 1 ? "item" : "items"}
                        {venueFoodItems.length > 0 ? (
                          <>
                            <span className="text-[var(--media-border)]"> · </span>
                            <span className="tabular-nums text-[var(--media-ink-muted)]">
                              {vendorCount}
                            </span>{" "}
                            {vendorCount === 1 ? "vendor" : "vendors"}
                          </>
                        ) : null}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-bold text-[var(--media-ink)]">
                          {topItem ? topItem.name : "No food items yet"}
                        </p>
                        {topItem?.ageRestricted ? (
                          <span className="rounded-full border border-[var(--media-border)] bg-[var(--media-surface)] px-1.5 py-0.5 text-[0.55rem] font-bold uppercase text-[var(--media-ink-dim)]">
                            21+
                          </span>
                        ) : null}
                      </div>
                      {topItem ? (
                        <p className="mt-1 text-xs">
                          <span className="media-rank-score">{topItem.slopScore.toFixed(1)} Slop</span>
                          <span className="text-[var(--media-ink-dim)]"> · {topItem.itemType}</span>
                        </p>
                      ) : null}
                    </div>

                    <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--media-orange-deep)]">
                      View venue →
                    </p>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
