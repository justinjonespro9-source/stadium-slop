import Link from "next/link";
import { notFound } from "next/navigation";

import { getFoodItemBySlug, getVenueBySlug } from "@/lib/sample-data";

const slopScoreOptions = [1, 2, 3, 4, 5];
const runItBackOptions = ["Run It Back", "Maybe", "Bench It"];
const valueOptions = ["Steal", "Fair Deal", "Stadium Tax", "Robbery"];
const servedRightOptions = ["Game Ready", "Fine", "Sat on the Bench", "N/A"];
const lineWaitOptions = [
  "Quick Stop",
  "Worth the Wait",
  "Too Long",
  "Missed the Action"
];
const napkinOptions = [
  "1 napkin · Clean Win",
  "2 napkins · Safe at Your Seat",
  "3 napkins · Two-Handed Problem",
  "4 napkins · Jersey Danger",
  "5 napkins · Full Cleanup Crew"
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
    <main className="min-h-screen bg-[#111111] text-white">
      <section className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-8 lg:px-10">
        <Link
          href={`/venues/${venue.slug}/${foodItem.slug}`}
          className="inline-flex text-sm font-bold text-zinc-400 hover:text-white"
        >
          Back to food details
        </Link>

        <header className="py-12">
          <p className="mb-4 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300">
            Mock Review Flow · {foodItem.itemType}
          </p>
          {foodItem.ageRestricted ? (
            <p className="mb-4 ml-2 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-zinc-300">
              21+
            </p>
          ) : null}
          <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Review {foodItem.name}
          </h1>
          <p className="mt-5 text-lg text-zinc-300">
            {venue.name} · {venue.city}, {venue.state}
          </p>
        </header>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Location Check
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Verify you&apos;re at the venue
          </h2>
          <p className="mt-4 text-zinc-400">
            Official Stadium Slop ratings are designed to come from fans near
            the stadium, arena, or ballpark. Location will be checked only when
            submitting a review — never in the background.
          </p>
          <div className="mt-5 rounded-2xl bg-black p-4">
            <p className="text-sm text-zinc-500">Review radius</p>
            <p className="mt-1 text-2xl font-black">
              {venue.reviewRadiusMeters} meters
            </p>
          </div>
          <button
            type="button"
            disabled
            className="mt-6 cursor-not-allowed rounded-full border border-zinc-700 px-6 py-3 text-sm font-bold text-zinc-500"
          >
            Location verification coming soon
          </button>
        </section>

        {foodItem.alcoholic ? (
          <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Responsible Drinking
            </p>
            <p className="mt-3 text-zinc-300">
              Alcohol availability varies by venue. Must be 21+ to purchase.
              Please drink responsibly.
            </p>
          </section>
        ) : null}

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Review Signals
          </p>
          <h2 className="mt-2 text-3xl font-black">Build your fan scorecard</h2>

          <div className="mt-8 space-y-8">
            <div>
              <h3 className="font-bold">Slop Score</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {slopScoreOptions.map((score) => (
                  <OptionPill key={score} label={`${score}`} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold">Would Eat Again</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {runItBackOptions.map((option) => (
                  <OptionPill key={option} label={option} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold">Value</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {valueOptions.map((option) => (
                  <OptionPill key={option} label={option} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold">Served Right</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {servedRightOptions.map((option) => (
                  <OptionPill key={option} label={option} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold">Line Wait</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {lineWaitOptions.map((option) => (
                  <OptionPill key={option} label={option} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold">Napkin Rating</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {napkinOptions.map((option) => (
                  <OptionPill key={option} label={option} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold">Short Review</h3>
              <textarea
                disabled
                placeholder="Tell fans what actually showed up at the seat..."
                className="mt-3 min-h-32 w-full cursor-not-allowed rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-zinc-400 outline-none placeholder:text-zinc-600"
              />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="font-bold">Photo uploads coming soon</p>
              <p className="mt-2 text-sm text-zinc-500">
                Fans will be able to attach verified on-site food photos when
                real submissions are added.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Trust
            </p>
            <p className="mt-3 text-xl font-black">
              Promoted placements can buy visibility, not ratings.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Scoreboards
            </p>
            <p className="mt-3 text-xl font-black">
              Verified reviews help keep scoreboards honest.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
