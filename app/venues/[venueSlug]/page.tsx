import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getFoodItemBySlug,
  getFoodItemsByVenueSlug,
  getPhotosForVenue,
  getVenueBySlug
} from "@/lib/sample-data";

type FoodItem = ReturnType<typeof getFoodItemsByVenueSlug>[number];

type VenuePageProps = {
  params: Promise<{
    venueSlug: string;
  }>;
};

function getScoreboardMovement(item: FoodItem) {
  if (!item.scoreboardRank || item.previousScoreboardRank === undefined) {
    return {
      label: "NEW",
      className: "text-amber-400"
    };
  }

  const movement = item.previousScoreboardRank - item.scoreboardRank;

  if (movement > 0) {
    return {
      label: `↑ ${movement}`,
      className: "text-green-400"
    };
  }

  if (movement < 0) {
    return {
      label: `↓ ${Math.abs(movement)}`,
      className: "text-red-400"
    };
  }

  return {
    label: "—",
    className: "text-zinc-500"
  };
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { venueSlug } = await params;
  const venue = getVenueBySlug(venueSlug);

  if (!venue) {
    notFound();
  }

  const venueFoodItems = getFoodItemsByVenueSlug(venue.slug).sort(
    (a, b) => b.slopScore - a.slopScore
  );
  const scoreboardItems = [...venueFoodItems]
    .sort((a, b) => {
      const rankA = a.scoreboardRank ?? Number.POSITIVE_INFINITY;
      const rankB = b.scoreboardRank ?? Number.POSITIVE_INFINITY;

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      return b.slopScore - a.slopScore;
    })
    .slice(0, 10);
  const newThisSeasonItems = venueFoodItems.filter(
    (item) => item.isNewThisSeason
  );
  const latestPhotos = getPhotosForVenue(venue.slug).slice(0, 6);

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
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Venue Scoreboard
              </p>
              <h2 className="mt-2 text-3xl font-black">
                {venue.name} Scoreboard
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Ranked by venue scoreboard position, then Slop Score.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
            {scoreboardItems.map((item) => {
              const movement = getScoreboardMovement(item);

              return (
                <Link
                  key={item.slug}
                  href={`/venues/${venue.slug}/${item.slug}`}
                  className="grid gap-4 border-b border-zinc-800 p-5 transition last:border-b-0 hover:bg-black sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  <div className="text-3xl font-black text-white">
                    #{item.scoreboardRank ?? "—"}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black">{item.name}</h3>
                      {item.venueBadge ? (
                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
                          {item.venueBadge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">
                      Slop Score {item.slopScore.toFixed(1)} · {item.verdict}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-black uppercase tracking-[0.2em] ${movement.className}`}
                  >
                    {movement.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-t border-zinc-800 py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Latest Fan Photos
              </p>
              <h2 className="mt-2 text-3xl font-black">
                What fans are seeing at {venue.name}
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Placeholder gallery until real uploads are added.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestPhotos.map((photo) => {
              const item = getFoodItemBySlug(photo.foodSlug);

              return (
                <Link
                  key={photo.id}
                  href={`/venues/${photo.venueSlug}/${photo.foodSlug}`}
                  className="group rounded-3xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-500"
                >
                  <div
                    aria-label={photo.alt}
                    className="flex aspect-video items-center justify-center rounded-2xl bg-black text-6xl"
                  >
                    {photo.imagePlaceholder}
                  </div>
                  <p className="mt-4 font-bold">
                    {item ? item.name : "Unknown item"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{photo.caption}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>{photo.createdAt}</span>
                    {photo.verifiedOnSite ? (
                      <span className="rounded-full border border-zinc-800 px-2 py-0.5 font-bold uppercase tracking-[0.15em] text-zinc-400">
                        Verified on-site
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
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
              Sorted by highest Slop Score first.
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
                      Slop Score {item.slopScore.toFixed(1)}
                    </div>
                  </div>

                  <p className="mt-4 font-bold text-zinc-300">
                    {item.verdict}
                  </p>
                  <p className="mt-2 text-zinc-400">{item.description}</p>

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
                      <p className="text-zinc-500">Run It Back</p>
                      <p className="mt-1 font-bold text-white">
                        {item.runItBackPercent}%
                      </p>
                    </div>
                    <div className="rounded-2xl bg-black p-4">
                      <p className="text-zinc-500">Value</p>
                      <p className="mt-1 font-bold text-white">
                        {item.valueLabel}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-black p-4">
                      <p className="text-zinc-500">Napkin Rating</p>
                      <p className="mt-1 font-bold text-white">
                        {item.napkinRating}/5 napkins
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
