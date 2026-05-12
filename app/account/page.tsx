import {
  getFoodItemBySlug,
  getVendorForFoodItem,
  getVenueForFoodItem
} from "@/lib/sample-data";

const mockProfile = {
  displayName: "Section 126 Snack Scout",
  handle: "@seat126snacks",
  homeVenue: "Target Field",
  initials: "SS",
  stats: {
    totalReviews: 18,
    helpfulLikes: 142,
    verifiedGameDayReviews: 14,
    photosUploaded: 11
  }
};

const mockReviewHistory = [
  {
    foodSlug: "loaded-cheese-curds",
    slopScore: 9.2,
    napkinRating: 3,
    helpfulLikes: 18,
    dateLabel: "Today"
  },
  {
    foodSlug: "frozen-lemonade",
    slopScore: 8.6,
    napkinRating: 2,
    helpfulLikes: 11,
    dateLabel: "Last homestand"
  },
  {
    foodSlug: "north-loop-old-fashioned",
    slopScore: 7.4,
    napkinRating: 1,
    helpfulLikes: 7,
    dateLabel: "May 2026"
  }
];

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:px-10">
        <p className="inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
          Reviewer profile
        </p>

        <header className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-3xl font-black text-black">
                {mockProfile.initials}
              </div>
              <button
                type="button"
                disabled
                className="mt-3 cursor-not-allowed rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-500"
              >
                Upload photo soon
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                {mockProfile.displayName}
              </h1>
              <p className="mt-2 text-zinc-400">{mockProfile.handle}</p>
              <p className="mt-3 text-sm text-zinc-500">
                Home venue: {mockProfile.homeVenue}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                Anyone can browse Stadium Slop. A free profile and on-site
                location check are required to leave verified reviews and move
                venue Season Standings.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Total reviews", mockProfile.stats.totalReviews],
            ["Helpful likes", mockProfile.stats.helpfulLikes],
            ["Verified game-day", mockProfile.stats.verifiedGameDayReviews],
            ["Photos uploaded", mockProfile.stats.photosUploaded]
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <p className="text-2xl font-black">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
                {label}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Reputation
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <p className="rounded-2xl bg-black p-4 text-sm leading-6 text-zinc-400">
              Helpful likes only. No public follower counts.
            </p>
            <p className="rounded-2xl bg-black p-4 text-sm leading-6 text-zinc-400">
              Trusted reviewers earn visibility through useful game-day intel.
            </p>
          </div>
        </section>

        <section className="mt-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Review history
          </p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
            {mockReviewHistory.map((review) => {
              const item = getFoodItemBySlug(review.foodSlug);

              if (!item) {
                return null;
              }

              const venue = getVenueForFoodItem(item);
              const vendor = getVendorForFoodItem(item);

              return (
                <article
                  key={`${review.foodSlug}-${review.dateLabel}`}
                  className="border-b border-zinc-800 px-4 py-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-black">{item.name}</h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        {venue?.name ?? "Venue TBD"} ·{" "}
                        {vendor?.name ?? "Vendor TBD"}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-black">
                      {review.slopScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span>{review.napkinRating}/5 napkins</span>
                    <span>{review.helpfulLikes} helpful</span>
                    <span>{review.dateLabel}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Sign-in placeholder
          </p>
          <div className="mt-4 grid gap-3">
            {[
              "Continue with email",
              "Continue with Google",
              "Continue with Apple"
            ].map((label) => (
              <button
                key={label}
                type="button"
                disabled
                className="cursor-not-allowed rounded-full border border-zinc-700 px-6 py-4 text-sm font-black text-zinc-500"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-500">Authentication coming soon.</p>
        </section>
      </section>
    </main>
  );
}
