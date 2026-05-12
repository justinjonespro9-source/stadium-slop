import Link from "next/link";
import { notFound } from "next/navigation";

import { getFoodItemsByVenueSlug, getVenueBySlug } from "@/lib/sample-data";

type VenuePageProps = {
  params: Promise<{
    venueSlug: string;
  }>;
};

export default async function VenuePage({ params }: VenuePageProps) {
  const { venueSlug } = await params;
  const venue = getVenueBySlug(venueSlug);

  if (!venue) {
    notFound();
  }

  const venueFoodItems = getFoodItemsByVenueSlug(venue.slug).sort(
    (a, b) => b.rating - a.rating
  );
  const newThisSeasonItems = venueFoodItems.filter(
    (item) => item.isNewThisSeason
  );

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight">
            STADIUM SLOP
          </Link>
          <div className="hidden gap-6 text-sm text-zinc-300 sm:flex">
            <Link href="/venues" className="hover:text-white">
              Venues
            </Link>
            <Link href="/#rankings" className="hover:text-white">
              Rankings
            </Link>
            <Link href="/#submit" className="hover:text-white">
              Submit Food
            </Link>
          </div>
        </nav>

        <Link
          href="/venues"
          className="mt-10 inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to venues
        </Link>

        <header className="py-12">
          <p className="mb-4 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300">
            {venue.venueType}
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            {venue.name}
          </h1>
          <p className="mt-5 text-lg text-zinc-300">
            {venue.city}, {venue.state}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
            <span className="rounded-full border border-zinc-800 px-4 py-2">
              {venue.leagues.join(", ")}
            </span>
            <span className="rounded-full border border-zinc-800 px-4 py-2">
              {venue.teams.join(", ")}
            </span>
            <span className="rounded-full border border-zinc-800 px-4 py-2">
              {venue.sports.join(", ")}
            </span>
          </div>
        </header>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Verified Review Zone
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {venue.reviewRadiusMeters} meters from the venue
          </h2>
          <p className="mt-3 max-w-3xl text-zinc-400">
            Future official reviews will require fans to be near {venue.name}
            before submitting a rating. Browsing stays public for everyone.
          </p>
        </section>

        <section className="border-t border-zinc-800 py-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              New This Season
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Fresh concession reports
            </h2>
          </div>

          {newThisSeasonItems.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {newThisSeasonItems.map((item) => (
                <Link
                  key={item.slug}
                  href={`/venues/${venue.slug}/${item.slug}`}
                  className="group rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-500"
                >
                  <article>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black">{item.name}</h3>
                      <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                        New This Season
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-zinc-400">
                      {item.category} · {item.location}
                    </p>
                    {item.seasonIntroduced ? (
                      <p className="mt-2 text-sm text-zinc-500">
                        Introduced: {item.seasonIntroduced}
                      </p>
                    ) : null}
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-zinc-500">
              No new items reported yet.
            </p>
          )}
        </section>

        <section className="border-t border-zinc-800 py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Food Rankings
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Rated bites at {venue.name}
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Sorted by highest fan rating first.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {venueFoodItems.map((item) => (
              <Link
                key={item.slug}
                href={`/venues/${venue.slug}/${item.slug}`}
                className="group rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-500"
              >
                <article>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                        {item.category}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-black">{item.name}</h3>
                        {item.isPromoted ? (
                          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                            Promoted
                          </span>
                        ) : null}
                        {item.isNewThisSeason ? (
                          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                            New This Season
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-black">
                      {item.rating.toFixed(1)}
                    </div>
                  </div>

                  <p className="mt-4 text-zinc-300">{item.description}</p>

                  <div className="mt-6 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
                    <div className="rounded-2xl bg-black p-4">
                      <p className="text-zinc-500">Location</p>
                      <p className="mt-1 font-bold text-white">
                        {item.location}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-black p-4">
                      <p className="text-zinc-500">Price</p>
                      <p className="mt-1 font-bold text-white">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-black p-4">
                      <p className="text-zinc-500">Worth It Score</p>
                      <p className="mt-1 font-bold text-white">
                        {item.worthItScore}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-black p-4">
                      <p className="text-zinc-500">Reviews</p>
                      <p className="mt-1 font-bold text-white">
                        {item.reviewCount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="mt-5 text-sm font-bold text-zinc-300 transition group-hover:text-white">
                    View food details
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
