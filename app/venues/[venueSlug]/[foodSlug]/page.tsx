import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getFoodItemBySlug,
  getPhotosForFoodItem,
  getVenueBySlug
} from "@/lib/sample-data";

const mockReviews = [
  {
    author: "Section 128 Regular",
    rating: 4.8,
    runItBack: "Yes",
    value: "Fair Deal",
    napkins: "3/5",
    comment:
      "Exactly the kind of concession stand win you hope for when the lines are moving."
  },
  {
    author: "Late Inning Snack Scout",
    rating: 4.2,
    runItBack: "Maybe",
    value: "Stadium Tax",
    napkins: "4/5",
    comment:
      "Pricey, but it feels more memorable than the usual backup-plan stadium food."
  },
  {
    author: "Upper Deck Critic",
    rating: 3.9,
    runItBack: "If nearby",
    value: "Fair Deal",
    napkins: "2/5",
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

  const foodPhotos = getPhotosForFoodItem(venue.slug, foodItem.slug);

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
        <Link
          href={`/venues/${venue.slug}`}
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to {venue.name}
        </Link>

        <header className="grid gap-8 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300">
              {foodItem.itemType} · {foodItem.category}
            </p>
            {foodItem.ageRestricted ? (
              <p className="mb-4 ml-2 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-zinc-300">
                21+
              </p>
            ) : null}
            {foodItem.isPromoted ? (
              <p className="mb-4 ml-2 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-zinc-300">
                Promoted
              </p>
            ) : null}
            {foodItem.isNewThisSeason ? (
              <p className="mb-4 ml-2 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-zinc-300">
                New This Season
              </p>
            ) : null}
            {foodItem.venueBadge ? (
              <p className="mb-4 ml-2 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-zinc-300">
                {foodItem.venueBadge}
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
                <p className="text-zinc-500">Slop Score</p>
                <p className="mt-1 text-2xl font-black">
                  {foodItem.slopScore.toFixed(1)}
                </p>
              </div>
              <div className="rounded-2xl bg-black p-4">
                <p className="text-zinc-500">Verdict</p>
                <p className="mt-1 text-xl font-black">{foodItem.verdict}</p>
              </div>
              <div className="rounded-2xl bg-black p-4">
                <p className="text-zinc-500">Run It Back</p>
                <p className="mt-1 text-2xl font-black">
                  {foodItem.runItBackPercent}%
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

        {foodItem.alcoholic ? (
          <section className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Responsible Drinking
            </p>
            <p className="mt-3 text-zinc-300">
              Alcohol availability varies by venue. Must be 21+ to purchase.
              Please drink responsibly.
            </p>
          </section>
        ) : null}

        <section className="border-t border-zinc-800 py-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Fan Signals
          </p>
          <h2 className="mt-2 text-3xl font-black">What fans are saying</h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Slop Score</p>
              <p className="mt-2 text-3xl font-black">
                {foodItem.slopScore.toFixed(1)}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Verdict</p>
              <p className="mt-2 text-xl font-black">{foodItem.verdict}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Run It Back</p>
              <p className="mt-2 text-3xl font-black">
                {foodItem.runItBackPercent}%
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Value</p>
              <p className="mt-2 text-xl font-black">{foodItem.valueLabel}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Served Right</p>
              <p className="mt-2 text-xl font-black">
                {foodItem.servedRightLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Line Wait</p>
              <p className="mt-2 text-xl font-black">
                {foodItem.lineWaitLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:col-span-2">
              <p className="text-sm text-zinc-500">Napkin Rating</p>
              <p className="mt-2 text-xl font-black">
                {foodItem.napkinRating}/5 napkins
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                {foodItem.napkinLabel}
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800 py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Fan Photos
              </p>
              <h2 className="mt-2 text-3xl font-black">
                What showed up at the seat
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Text placeholders until real uploads are added.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {foodPhotos.map((photo) => (
              <article
                key={photo.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <div
                  aria-label={photo.alt}
                  className="flex aspect-video items-center justify-center rounded-2xl bg-black text-7xl"
                >
                  {photo.imagePlaceholder}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{photo.caption}</h3>
                  {photo.verifiedOnSite ? (
                    <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
                      Verified on-site
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  Uploaded by {photo.uploadedBy} · {photo.createdAt}
                </p>
              </article>
            ))}
          </div>

          <article className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Photo uploads coming soon
            </p>
            <p className="mt-3 max-w-3xl text-zinc-400">
              Fans will be able to add verified on-site food photos so everyone
              can see what actually showed up at the seat.
            </p>
          </article>
        </section>

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
                  <p className="text-zinc-500">Item Type</p>
                  <p className="mt-1 font-bold text-white">
                    {foodItem.itemType}
                  </p>
                </div>
                {foodItem.beverageStyle ? (
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-zinc-500">Beverage Style</p>
                    <p className="mt-1 font-bold text-white">
                      {foodItem.beverageStyle}
                    </p>
                  </div>
                ) : null}
                {foodItem.ageRestricted ? (
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-zinc-500">Age Restricted</p>
                    <p className="mt-1 font-bold text-white">21+</p>
                  </div>
                ) : null}
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Location</p>
                  <p className="mt-1 font-bold text-white">
                    {foodItem.location}
                  </p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-zinc-500">Availability</p>
                  <p className="mt-1 font-bold text-white">
                    {foodItem.availabilityStatus ?? "Status pending"}
                  </p>
                </div>
                {foodItem.venueBadge ? (
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-zinc-500">Venue Badge</p>
                    <p className="mt-1 font-bold text-white">
                      {foodItem.venueBadge}
                    </p>
                  </div>
                ) : null}
                {foodItem.seasonIntroduced ? (
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-zinc-500">Season Introduced</p>
                    <p className="mt-1 font-bold text-white">
                      {foodItem.seasonIntroduced}
                    </p>
                  </div>
                ) : null}
                {foodItem.lastConfirmed ? (
                  <div className="rounded-2xl bg-black p-4">
                    <p className="text-zinc-500">Last Confirmed</p>
                    <p className="mt-1 font-bold text-white">
                      {foodItem.lastConfirmed}
                    </p>
                  </div>
                ) : null}
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

            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-3">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Review This Item
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Verify you&apos;re at the venue
              </h2>
              <p className="mt-4 max-w-3xl text-zinc-400">
                To keep ratings legit, Stadium Slop will check your current
                location before accepting an official review.
              </p>
              <Link
                href={`/venues/${venue.slug}/${foodItem.slug}/review`}
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                Review this item
              </Link>
              <p className="mt-3 text-sm text-zinc-500">
                Location verification coming soon.
              </p>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-3">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Accuracy
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Help keep this item accurate
              </h2>
              <p className="mt-4 max-w-3xl text-zinc-400">
                Menus change fast. Fans will be able to report price changes,
                wrong sections, new photos, or retired items.
              </p>
              <button
                type="button"
                disabled
                className="mt-6 cursor-not-allowed rounded-full border border-zinc-700 px-6 py-3 text-sm font-bold text-zinc-500"
              >
                Corrections coming soon
              </button>
            </article>
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
                  <div>
                    <h3 className="font-bold">{review.author}</h3>
                    <span className="mt-2 inline-flex rounded-full border border-zinc-800 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
                      Verified on-site
                    </span>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-black">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  {review.comment}
                </p>
                <div className="mt-5 grid gap-2 text-xs text-zinc-400">
                  <p>
                    <span className="text-zinc-600">Run It Back:</span>{" "}
                    {review.runItBack}
                  </p>
                  <p>
                    <span className="text-zinc-600">Value:</span>{" "}
                    {review.value}
                  </p>
                  <p>
                    <span className="text-zinc-600">Napkins:</span>{" "}
                    {review.napkins}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
