"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from "react";

import type { Venue } from "@/lib/sample-data";
import { venueTypeGlyph } from "@/lib/venue-display";
import { filterVenuesBySearch } from "@/lib/venue-search";
import { formatVenueTeamsInline } from "@/lib/venue-teams";
import { VenueSearchEmpty } from "@/components/venue-search-empty";

const HOME_RESULTS_MAX = 8;

type HomeVenueSearchProps = {
  venues: Venue[];
};

export function HomeVenueSearch({ venues }: HomeVenueSearchProps) {
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = useMemo(() => filterVenuesBySearch(venues, query), [venues, query]);
  const capped = useMemo(
    () => filtered.slice(0, HOME_RESULTS_MAX),
    [filtered]
  );

  const showEmpty = query.trim().length > 0 && filtered.length === 0;
  const showList = !showEmpty && query.trim().length > 0 && capped.length > 0;
  const hasMore = filtered.length > capped.length;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, capped.length);
    if (activeIndex < 0 || activeIndex >= capped.length) {
      return;
    }
    rowRefs.current[activeIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex, capped.length]);

  const moveActive = useCallback(
    (delta: number) => {
      if (capped.length === 0) {
        return;
      }
      setActiveIndex((prev) => {
        if (delta > 0) {
          const next = prev < 0 ? 0 : Math.min(prev + delta, capped.length - 1);
          return next;
        }
        return Math.max(0, prev < 0 ? 0 : prev + delta);
      });
    },
    [capped.length]
  );

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showEmpty) {
      if (e.key === "Escape") {
        e.preventDefault();
        setActiveIndex(-1);
      }
      return;
    }
    if (!showList) {
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveActive(-1);
        break;
      case "Enter":
        if (activeIndex >= 0 && capped[activeIndex]) {
          e.preventDefault();
          router.push(`/venues/${capped[activeIndex].slug}`);
        }
        break;
      case "Escape":
        e.preventDefault();
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="brand-panel rounded-2xl border p-1.5 shadow-2xl sm:rounded-[1.85rem] sm:p-2">
      <label className="block px-0.5 pt-0.5">
        <span className="sr-only">Search venues</span>
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          aria-expanded={Boolean(query.trim() && (showEmpty || capped.length > 0))}
          aria-controls={showList ? listboxId : undefined}
          aria-activedescendant={
            showList && activeIndex >= 0
              ? `venue-search-opt-${listboxId}-${activeIndex}`
              : undefined
          }
          aria-autocomplete="list"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Venue, city, team, league…"
          className="w-full rounded-xl border border-[var(--slop-line-strong)] bg-[var(--slop-navy-deep)] px-3.5 py-3 text-[0.95rem] font-semibold text-[var(--slop-cream)] outline-none ring-[var(--slop-gold)] placeholder:text-[var(--slop-cream-dim)] focus-visible:ring-2 sm:rounded-[1.35rem] sm:px-4 sm:py-3.5 sm:text-base"
        />
      </label>

      {showEmpty ? (
        <div className="border-t border-[var(--slop-line)] px-2 py-3">
          <VenueSearchEmpty />
        </div>
      ) : null}

      {showList ? (
        <div className="border-t border-[var(--slop-line)]">
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Matching venues"
            className="max-h-[min(16.5rem,calc(100dvh-12rem))] overflow-y-auto py-1.5 sm:py-2"
          >
            {capped.map((venue, index) => {
              const teamLine = formatVenueTeamsInline(venue.teams);
              const metaChips =
                teamLine.length > 96 ? `${teamLine.slice(0, 96)}…` : teamLine;

              const isActive = index === activeIndex;

              return (
                <li
                  key={venue.slug}
                  id={`venue-search-opt-${listboxId}-${index}`}
                  role="option"
                  aria-selected={isActive}
                  className="px-2 sm:px-2.5"
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <Link
                    ref={(el) => {
                      rowRefs.current[index] = el;
                    }}
                    href={`/venues/${venue.slug}`}
                    tabIndex={-1}
                    className={`flex gap-2.5 rounded-lg border border-transparent border-l-[3px] border-l-transparent px-2.5 py-2 transition sm:gap-3 sm:px-3 sm:py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--slop-gold)] ${
                      isActive
                        ? "border-[var(--slop-line-strong)] border-l-[var(--slop-gold)] bg-[rgba(244,179,33,0.12)] shadow-[inset_0_0_0_1px_rgba(244,179,33,0.14)]"
                        : "hover:border-[var(--slop-line-strong)] hover:border-l-[rgba(244,179,33,0.5)] hover:bg-[color:rgba(255,244,223,0.048)] active:bg-[color:rgba(255,244,223,0.06)]"
                    }`}
                  >
                    <span className="min-w-0 flex-1 text-left">
                      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-[0.9rem] font-black leading-snug tracking-tight text-[var(--slop-cream)] sm:text-base">
                          {venue.name}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.09em] text-[var(--slop-gold-dim)] sm:text-[0.6rem]">
                          {venue.venueTypeKey ? (
                            <span className="text-sm leading-none" aria-hidden>
                              {venueTypeGlyph(venue.venueTypeKey) ?? ""}
                            </span>
                          ) : null}
                          <span>{venue.venueType}</span>
                        </span>
                      </span>
                      <span className="mt-1 block text-[0.72rem] text-[var(--slop-cream-muted)]">
                        {venue.city}, {venue.state}
                        {metaChips ? (
                          <>
                            {" "}
                            <span aria-hidden className="text-[var(--slop-line)]">
                              —
                            </span>{" "}
                            <span className="font-semibold text-[var(--slop-cream-dim)]">
                              {metaChips}
                            </span>
                          </>
                        ) : null}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {hasMore ? (
            <p className="border-t border-[var(--slop-line)] px-3 py-1.5 text-center text-[0.65rem] text-[var(--slop-cream-dim)]">
              +{filtered.length - capped.length} more — refine or{" "}
              <Link href="/venues" className="font-bold text-[var(--slop-gold)] underline-offset-2 hover:underline">
                browse all venues
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="border-t border-[var(--slop-line)] px-4 py-1.5 text-center text-[0.68rem] text-[color:rgba(255,244,223,0.45)] sm:py-2">
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
