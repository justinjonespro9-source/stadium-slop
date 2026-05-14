import Link from "next/link";

import type { Venue } from "@/lib/sample-data";

/** Populated MLB seed parks — order is intentional for the homepage grid. */
export const FEATURED_MLB_PARK_SLUGS = [
  "target-field",
  "wrigley-field",
  "fenway-park",
  "dodger-stadium",
  "petco-park",
  "citizens-bank-park"
] as const;

export function resolveFeaturedMlbParks(venues: Venue[]): Venue[] {
  const bySlug = new Map(venues.map((v) => [v.slug, v]));
  return FEATURED_MLB_PARK_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (v): v is Venue => v != null
  );
}

export function HomeFeaturedMlbParks({ parks }: { parks: Venue[] }) {
  if (parks.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="featured-parks-heading" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slop-blue)]">
            MLB ballparks
          </p>
          <h2
            id="featured-parks-heading"
            className="mt-1 text-xl font-black tracking-tight text-[var(--slop-cream)] sm:text-2xl"
          >
            Featured parks
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Deep menus, fan-ranked</p>
        </div>
        <Link
          href="/venues"
          className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 underline-offset-2 hover:text-[var(--slop-blue)] hover:underline"
        >
          All venues
        </Link>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {parks.map((venue) => {
          const team = venue.teams[0];
          return (
            <li key={venue.slug}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--slop-line)] bg-[color:rgba(11,15,20,0.55)]">
                <Link
                  href={`/venues/${venue.slug}`}
                  className="block flex-1 px-4 py-4 transition hover:bg-[color:rgba(255,244,223,0.04)]"
                >
                  <h3 className="text-base font-black leading-snug text-white sm:text-lg">
                    {venue.name}
                  </h3>
                  <p className="mt-1 text-sm text-[color:rgba(255,244,223,0.62)]">
                    {venue.city}, {venue.state}
                  </p>
                  {team ? (
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                      {team}
                    </p>
                  ) : null}
                </Link>
                <div className="grid grid-cols-2 border-t border-[var(--slop-line)] text-center text-xs font-black uppercase tracking-[0.1em]">
                  <Link
                    href={`/venues/${venue.slug}`}
                    className="border-r border-[var(--slop-line)] py-2.5 text-[var(--slop-cream)] transition hover:bg-[color:rgba(255,244,223,0.06)]"
                  >
                    Standings
                  </Link>
                  <Link
                    href={`/venues/${venue.slug}?mode=fresh`}
                    className="py-2.5 text-[var(--slop-orange)] transition hover:bg-[color:rgba(255,244,223,0.06)]"
                  >
                    Game Day Fresh
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
