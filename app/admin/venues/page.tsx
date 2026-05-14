import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { venueTypeLabel } from "@/lib/venue-display";

type AdminVenuesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminVenuesPage({ searchParams }: AdminVenuesPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const where =
    query.length > 0
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { slug: { contains: query, mode: "insensitive" as const } },
            { city: { contains: query, mode: "insensitive" as const } },
            { state: { contains: query, mode: "insensitive" as const } }
          ]
        }
      : undefined;

  const [venues, totals] = await Promise.all([
    prisma.venue.findMany({
      where,
      orderBy: [{ state: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            vendors: true,
            items: true
          }
        }
      }
    }),
    prisma.venue.count()
  ]);

  const shown = venues.length;
  const summary =
    query.length > 0
      ? `${shown} match${shown === 1 ? "" : "es"} · ${totals} total venues`
      : `${totals} venues`;

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/admin"
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to admin
        </Link>

        <header className="mt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="brand-pill inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
                Admin cleanup
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                Venues
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                Edit venue basics, then drill into related vendors and food items.
                Records are not deleted from this view.
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                {summary}
              </p>
            </div>
            <Link
              href="/admin/venues/new"
              className="inline-flex w-fit rounded-full border border-[var(--slop-orange)] px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] text-[var(--slop-orange)] transition hover:bg-[var(--slop-orange)] hover:text-[var(--slop-ink)]"
            >
              Add venue
            </Link>
          </div>
        </header>

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
          method="get"
          action="/admin/venues"
        >
          <label className="grid flex-1 gap-2 text-sm font-bold text-zinc-300">
            Search venues
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Name, slug, city, or state"
              className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-full border border-zinc-600 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-zinc-200 hover:border-[var(--slop-orange)] hover:text-[var(--slop-orange)]"
            >
              Search
            </button>
            {query ? (
              <Link
                href="/admin/venues"
                className="inline-flex items-center rounded-full border border-zinc-700 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-zinc-400 hover:text-white"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>

        <section className="mt-8 grid gap-3">
          {venues.length === 0 ? (
            <p className="rounded-3xl border border-zinc-800 bg-black p-6 text-sm text-zinc-500">
              No venues match &ldquo;{query}&rdquo;. Try a shorter search or clear filters.
            </p>
          ) : (
            venues.map((venue) => (
              <Link
                key={venue.id}
                href={`/admin/venues/${venue.id}`}
                className="brand-card rounded-3xl border p-5 transition hover:border-[var(--slop-orange)]"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <h2 className="text-xl font-black">{venue.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {venue.city}, {venue.state} · {venueTypeLabel(venue.venueType)}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                      {venue.slug}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                    <div className="flex gap-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                      <span>{venue._count.vendors} vendors</span>
                      <span>{venue._count.items} items</span>
                    </div>
                    <span className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                      Edit
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
