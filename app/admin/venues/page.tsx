import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { venueTypeLabel } from "@/lib/venue-display";

export default async function AdminVenuesPage() {
  const venues = await prisma.venue.findMany({
    orderBy: [{ state: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          vendors: true,
          items: true
        }
      }
    }
  });

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
            </div>
            <Link
              href="/admin/venues/new"
              className="inline-flex w-fit rounded-full border border-[var(--slop-orange)] px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] text-[var(--slop-orange)] transition hover:bg-[var(--slop-orange)] hover:text-[var(--slop-ink)]"
            >
              Add venue
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-3">
          {venues.map((venue) => (
            <Link
              key={venue.id}
              href={`/admin/venues/${venue.id}`}
              className="brand-card rounded-3xl border p-5 transition hover:border-[var(--slop-orange)]"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-xl font-black">{venue.name}</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {venue.city}, {venue.state} · {venueTypeLabel(venue.venueType)}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                    {venue.slug}
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                  <span>{venue._count.vendors} vendors</span>
                  <span>{venue._count.items} items</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
