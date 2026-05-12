const featuredVenues = [
  {
    name: "Target Field",
    city: "Minneapolis, MN",
    team: "Minnesota Twins",
    topItem: "Loaded cheese curds",
    rating: "4.6"
  },
  {
    name: "U.S. Bank Stadium",
    city: "Minneapolis, MN",
    team: "Minnesota Vikings",
    topItem: "Brisket sandwich",
    rating: "4.4"
  },
  {
    name: "Xcel Energy Center",
    city: "St. Paul, MN",
    team: "Minnesota Wild",
    topItem: "Walleye basket",
    rating: "4.3"
  }
];

const categories = [
  "Best Overall",
  "Best Value",
  "Most Overpriced",
  "Worth the Line",
  "Worst Slop",
  "Hidden Gems"
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          <div className="text-xl font-black tracking-tight">STADIUM SLOP</div>
          <div className="hidden gap-6 text-sm text-zinc-300 sm:flex">
            <a href="#venues" className="hover:text-white">
              Venues
            </a>
            <a href="#rankings" className="hover:text-white">
              Rankings
            </a>
            <a href="#submit" className="hover:text-white">
              Submit Food
            </a>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300">
              Fan-powered food reviews for sports venues
            </p>

            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Find what&apos;s worth eating before you hit the concession line.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Stadium Slop helps fans rate, review, and rank the food inside
              stadiums, arenas, and ballparks — from legendary bites to
              overpriced disasters.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#venues"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                Browse Venues
              </a>
              <a
                href="#submit"
                className="rounded-full border borderinc-600 px-6 py-3 text-center text-sm font-bold text-white transition hover:border-white"
              >
                Submit a Review
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
                Current Leaderboard
              </p>
              <h2 className="mt-3 text-3xl font-black">Top Stadium Bites</h2>

              <div className="mt-6 space-y-4">
                {featuredVenues.map((venue, index) => (
                  <div
                    key={venue.name}
                    className="rounded-2xl border border-zinc-800 bg-black p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-zinc-500">#{index + 1}</p>
                        <h3 className="text-lg font-bold">{venue.topItem}</h3>
                        <p className="mt-1 text-sm text-zinc-400">
                          {venue.name} · {venue.city}
                        </p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-black">
                        {venue.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section id="venues" className="border-t border-zinc-800 py-14">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Browse Venues
              </p>
              <h2 className="mt-2 text-3xl font-black">Start with Minnesota</h2>
            </div>
            <p className="max-w-xl text-znc-400">
              We&apos;ll start local, prove the flow, then expand across every
              major sports venue.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featuredVenues.map((venue) => (
              <article
                key={venue.name}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <h3 className="text-xl font-black">{venue.name}</h3>
                <p className="mt-2 text-sm text-zinc-400">{venue.city}</p>
                <p className="mt-4 text-sm text-zinc-500">{venue.team}</p>
                <div className="mt-6 rounded-2xl bg-black p-4">
                  <p className="text-sm text-zinc-500">Top item</p>
                  <p className="mt-1 font-bold">{venue.topItem}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="rankings" className="border-t border-zinc-800 py-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Rankings
          </p>
          <h2 className="mt-2 text-3xl font-black">Every bite needs a category.</h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 font-bold"
              >
                {category}
              </div>
            ))}
          </div>
        </section>

        <section
          id="submit"
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8"
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Coming Soon
          </p>
          <h2 className="mt-2 text-3xl font-black">Submit a stadium food review.</h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Next we&apos;ll add sample food pages, venue pages, review cards,
            ratings, and eventually photo uploads.
          </p>
        </section>
      </section>
    </main>
  );
}
