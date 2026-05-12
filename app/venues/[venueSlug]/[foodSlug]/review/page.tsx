import Link from "next/link";
import { notFound } from "next/navigation";

import { getFoodItemBySlug, getVenueBySlug } from "@/lib/sample-data";

const slopScoreOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const runItBackOptions = ["Run It Back", "Maybe", "Bench It"];
const valueOptions = ["Steal", "Fair Deal", "Stadium Tax", "Robbery"];
const napkinOptions = [
  { value: 1, label: "Clean Win" },
  { value: 2, label: "Safe at Your Seat" },
  { value: 3, label: "Two-Handed Problem" },
  { value: 4, label: "Jersey Danger" },
  { value: 5, label: "Full Cleanup Crew" }
];

type ReviewPageProps = {
  params: Promise<{
    venueSlug: string;
    foodSlug: string;
  }>;
};

function OptionPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className="cursor-not-allowed rounded-full border border-zinc-800 bg-black px-4 py-2 text-sm font-bold text-zinc-400"
    >
      {label}
    </button>
  );
}

function ScoreButton({ score }: { score: number }) {
  return (
    <button
      type="button"
      disabled
      className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-2xl border border-zinc-800 bg-black text-lg font-black text-zinc-300"
    >
      {score}
    </button>
  );
}

function NapkinButton({
  value,
  label
}: {
  value: number;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled
      className="cursor-not-allowed rounded-2xl border border-zinc-800 bg-black p-3 text-left"
    >
      <span className="block text-lg">{"▰".repeat(value)}</span>
      <span className="mt-1 block text-sm font-bold text-zinc-300">
        {value}/5 napkins
      </span>
      <span className="mt-1 block text-xs text-zinc-500">{label}</span>
    </button>
  );
}

export default async function ReviewPage({ params }: ReviewPageProps) {
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
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 lg:px-10">
        <Link
          href={`/venues/${venue.slug}/${foodItem.slug}`}
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to food details
        </Link>

        <header className="py-6 sm:py-10">
          <p className="mb-3 inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
            Mock Review Flow · {foodItem.itemType}
          </p>
          {foodItem.ageRestricted ? (
            <p className="mb-3 ml-2 inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">
              21+
            </p>
          ) : null}
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Review {foodItem.name}
          </h1>
          <p className="mt-3 text-base text-zinc-300 sm:text-lg">
            {venue.name} · {venue.city}, {venue.state}
          </p>
        </header>

        <section className="brand-panel rounded-3xl border p-4 sm:p-6">
          <div className="rounded-2xl bg-black p-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Sign-in required
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              You must be signed in to submit a Stadium Slop review. Reviews are
              saved to your reviewer profile so fans can trust who contributed
              the score.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled
                className="brand-cta cursor-not-allowed rounded-full px-5 py-3 text-sm font-black opacity-70"
              >
                Sign in coming soon
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-full border border-zinc-700 px-5 py-3 text-sm font-black text-zinc-500"
              >
                Create profile coming soon
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-black p-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Verified game-day
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Today&apos;s reviews help power Game Day Fresh. Verified game-day
              reviews carry more weight, especially when they include a fan
              photo of what actually showed up.
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Quick scorecard
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Tap it, snap it, move on.
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Slop Score and Napkin Rating are required because structured
              signals power Season Standings. Photo and note are optional.
            </p>
          </div>

          <div className="mt-6 space-y-7">
            <div>
              <h3 className="text-lg font-black">1. Slop Score</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Overall quality, 1-10. Think fan score, not restaurant review.
              </p>
              <div className="mt-3 grid grid-cols-5 gap-2 sm:flex sm:flex-wrap">
                {slopScoreOptions.map((score) => (
                  <ScoreButton key={score} score={score} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black">2. Napkin Rating</h3>
              <p className="mt-2 text-sm text-zinc-500">
                How sloppy was it? This measures messiness, not quality.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                {napkinOptions.map((option) => (
                  <NapkinButton
                    key={option.value}
                    value={option.value}
                    label={option.label}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black p-5">
              <h3 className="text-lg font-black">3. Optional photo</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Add a photo to make your review more trusted. Photos help other
                fans know what actually showed up, and verified game-day photos
                help power Game Day Fresh. Optional for now.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 flex aspect-video w-full cursor-not-allowed flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 text-center text-sm font-bold text-zinc-500"
              >
                Food photo upload coming soon
                <span className="mt-2 text-xs font-medium text-zinc-600">
                  No polished vendor shots. Fan photos first.
                </span>
              </button>
              <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm font-black text-zinc-300">
                  Menu board / price proof
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Optional later: snap the menu board or receipt-style price so
                  fans can confirm price updates without making this a checkout
                  form.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black">4. Optional food note</h3>
              <p className="mt-2 text-sm text-zinc-500">
                One quick food-focused reaction is enough. Aim for 280-300
                characters max. No comment threads, no dislikes.
              </p>
              <textarea
                disabled
                placeholder="Optional: hot, cold, worth it, messy, would run it back?"
                className="mt-3 min-h-24 w-full cursor-not-allowed rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-zinc-400 outline-none placeholder:text-zinc-600"
              />
            </div>

            <div className="rounded-2xl bg-black p-4">
              <p className="text-sm font-bold text-zinc-300">
                Want to add more signals later?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {runItBackOptions.map((option) => (
                  <OptionPill key={option} label={option} />
                ))}
                {valueOptions.slice(0, 3).map((option) => (
                  <OptionPill key={option} label={option} />
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="brand-cta mt-7 w-full cursor-not-allowed rounded-full px-6 py-4 text-sm font-black opacity-60"
          >
            Sign in to submit review
          </button>
        </section>

        {foodItem.alcoholic ? (
          <section className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Responsible Drinking
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Alcohol availability varies by venue. Must be 21+ to purchase.
              Please drink responsibly.
            </p>
          </section>
        ) : null}

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Trust
            </p>
            <p className="mt-3 text-lg font-black">
              Promoted placements can buy visibility, not ratings.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Season Standings
            </p>
            <p className="mt-3 text-lg font-black">
              Verified reviews help keep Season Standings honest.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
