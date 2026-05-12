import Link from "next/link";
import { notFound } from "next/navigation";

import { getFoodItemBySlug, getVenueBySlug } from "@/lib/sample-data";

const mockReviews = [
  {
    author: "Section 128 Regular",
    rating: 4.8,
    comment:
      "Exactly the kind of concession stand win you hope for when the lines are moving."
  },
  {
    author: "Late Inning Snack Scout",
    rating: 4.2,
    comment:
      "Pricey, but it feels more memorable than the usual backup-plan stadium food."
  },
  {
    author: "Upper Deck Critic",
    rating: 3.9,
    comment:
      "Worth trying once, especially if you are already nearby and hungry."
  }
];

type FoodPageProps = {
  params: Promise<{
    venueSlug: string;
    foodSlug: string;
  }>;
};

export default async function FoodPage({ params }: FoodPageProps) {
  const { venueSlug, foodSlug } = await params;
  const venue = getVenueBySlug(venueSlug);

  if (!venue) {
    notFound();
  }

  const foodItem = getFoodItemBySlug(foodSlug);

  if (!foodItem || foodItem.venueSlug !== venue.slug) {
    notFound();
  }

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
          href={`/venues/${venue.slug}`}
          className="mt-10 inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to {venue.name}
        </Link>

        <header className="grid gap-8 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300">
              {foodItem.category}
            </p>
            {foodItem.isPromoted ? (
              <p className="mb-4 ml-2 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-zinc-300">
                Promoted
              </p>
            ) : null}
            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              {foodItem.name}
            </h1>
            <p className="mt-5 text-lg text-zinc-300">{foodItem.description}</p>
            <p className="mt-6 text-zinc-400">
              {venue.name} · {venue.city}, {venue.state}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-black p-4">
                <p className="text-zinc-500">Rating</p>
                <p className="mt-1 text-2xl font-black">
                  {foodItem.rating.toFixed(1)}
                </p>
              </div>
              <div className="rounded-2xl bg-black p-4">
                <p className="text-zinc-500">Worth It</p>
                <p className="mt-1 text-2xl font-black">
                  {foodItem.worthItScore}
                </p>
              </div>
              <div className="rounded-2xl bg-black p-4">
                <p className="text-zinc-500">Price</p>
                <p className="mt-1 text-2xl font-black">
                  ${foodItem.price.toFixed(2)}
                </p>
              </div>
              <div className="rounded-2xl bg-black p-4">
                <p className="text-zinc-500">Reviews</p>
                <p className="mt-1 text-2xl font-black">
                  {foodItem.reviewCount}
                </p>
              </div>
            </div>
          </div>
        </header>

        {foodItem.isPromoted && foodItem.sponsorDisclosure ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Sponsor Disclosure
            </p>
            <p className="mt-3 text-zinc-300">{foodItem.sponsorDisclosure}</p>
            {foodItem.sponsorName ? (
              <p className="mt-2 text-sm text-zinc-500">
                Sponsor: {foodItem.sponsorName}
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="border-t border-zinc-800 py-10">
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-2">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Food Details
              </p>
              <div className="mt-6 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Venue</p>
                  <p className="mt-1 font-bold text-white">{venue.name}</p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">City</p>
                  <p className="mt-1 font-bold text-white">
                    {venue.city}, {venue.state}
                  </p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Category</p>
                  <p className="mt-1 font-bold text-white">
                    {foodItem.category}
                  </p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Location</p>
                  <p className="mt-1 font-bold text-white">
                    {foodItem.location}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {foodItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Venue Context
              </p>
              <p className="mt-4 text-2xl font-black">{venue.venueType}</p>
              <p className="mt-3 text-sm text-zinc-400">
                {venue.leagues.join(", ")} · {venue.teams.join(", ")}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                {venue.sports.join(", ")} · {venue.region}
              </p>
            </aside>
          </div>
        </section>

        <section className="border-t border-zinc-800 py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Mock Reviews
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Early fan reactions
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Static placeholders until real reviews are added.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {mockReviews.map((review) => (
              <article
                key={review.author}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-bold">{review.author}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-black">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
