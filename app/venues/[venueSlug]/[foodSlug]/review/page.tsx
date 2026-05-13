import Link from "next/link";
import { ConsensusLabel } from "@prisma/client";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getFoodItemBySlug, getVenueBySlug } from "@/lib/sample-data";
import { prisma } from "@/lib/prisma";
import {
  MOCK_REVIEWER_EMAIL,
  MOCK_REVIEWER_USER_ID,
  MOCK_USER_COOKIE_NAME,
  hasMockUserAccess,
  mockReviewerProfile
} from "@/lib/user-auth";

const slopScoreOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const consensusOptions = [
  { label: "Run It Back", value: ConsensusLabel.RUN_IT_BACK },
  { label: "Worth the Walk", value: ConsensusLabel.WORTH_THE_WALK },
  { label: "Steal", value: ConsensusLabel.STEAL },
  { label: "Stadium Tax", value: ConsensusLabel.STADIUM_TAX },
  { label: "Bench It", value: ConsensusLabel.BENCH_IT }
];
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

function ConsensusOption({
  label,
  value
}: {
  label: string;
  value: ConsensusLabel;
}) {
  return (
    <label className="cursor-pointer">
      <input className="peer sr-only" type="radio" name="consensusLabel" value={value} />
      <span className="block rounded-full border border-zinc-800 bg-black px-4 py-2 text-sm font-bold text-zinc-400 peer-checked:border-[var(--slop-orange)] peer-checked:bg-[var(--slop-orange)] peer-checked:text-[var(--slop-ink)]">
        {label}
      </span>
    </label>
  );
}

function ScoreButton({ score }: { score: number }) {
  return (
    <label className="cursor-pointer">
      <input
        className="peer sr-only"
        type="radio"
        name="slopScore"
        value={score}
        required
      />
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-black text-lg font-black text-zinc-300 peer-checked:border-[var(--slop-orange)] peer-checked:bg-[var(--slop-orange)] peer-checked:text-[var(--slop-ink)]">
        {score}
      </span>
    </label>
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
    <label className="cursor-pointer">
      <input
        className="peer sr-only"
        type="radio"
        name="napkinRating"
        value={value}
        required
      />
      <span className="block rounded-2xl border border-zinc-800 bg-black p-3 text-left peer-checked:border-[var(--slop-orange)] peer-checked:bg-[color:rgba(255,159,28,0.14)]">
        <span className="block text-lg">{"▰".repeat(value)}</span>
        <span className="mt-1 block text-sm font-bold text-zinc-300">
          {value}/5 napkins
        </span>
        <span className="mt-1 block text-xs text-zinc-500">{label}</span>
      </span>
    </label>
  );
}

async function submitReview(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );
  const venueSlug = String(formData.get("venueSlug") ?? "");
  const foodSlug = String(formData.get("foodSlug") ?? "");
  const itemPath = `/venues/${venueSlug}/${foodSlug}`;

  if (!isSignedIn) {
    redirect(`/login?next=${encodeURIComponent(`${itemPath}/review`)}`);
  }

  const slopScore = Number(formData.get("slopScore"));
  const napkinRating = Number(formData.get("napkinRating"));
  const consensusLabel = formData.get("consensusLabel");
  const noteValue = String(formData.get("note") ?? "").trim();

  if (
    !Number.isFinite(slopScore) ||
    slopScore < 1 ||
    slopScore > 10 ||
    !Number.isInteger(napkinRating) ||
    napkinRating < 1 ||
    napkinRating > 5
  ) {
    redirect(`${itemPath}/review?error=missing-score`);
  }

  const venue = await prisma.venue.findUnique({
    where: { slug: venueSlug }
  });

  const foodItem = venue
    ? await prisma.foodItem.findUnique({
        where: {
          venueId_slug: {
            venueId: venue.id,
            slug: foodSlug
          }
        }
      })
    : null;

  if (!venue || !foodItem) {
    redirect(itemPath);
  }

  const user = await prisma.user.upsert({
    where: { id: MOCK_REVIEWER_USER_ID },
    update: {
      email: MOCK_REVIEWER_EMAIL,
      displayName: mockReviewerProfile.displayName,
      handle: mockReviewerProfile.handle,
      homeVenueId: venue.id
    },
    create: {
      id: MOCK_REVIEWER_USER_ID,
      email: MOCK_REVIEWER_EMAIL,
      displayName: mockReviewerProfile.displayName,
      handle: mockReviewerProfile.handle,
      homeVenueId: venue.id
    }
  });

  const today = new Date();
  const seasonLabel = String(today.getFullYear());
  const gameDayKey = `${seasonLabel}-${venueSlug}-${today.toISOString().slice(0, 10)}`;
  const labels =
    typeof consensusLabel === "string" && consensusLabel in ConsensusLabel
      ? [consensusLabel as ConsensusLabel]
      : [];

  await prisma.review.upsert({
    where: {
      userId_foodItemId_gameDayKey: {
        userId: user.id,
        foodItemId: foodItem.id,
        gameDayKey
      }
    },
    update: {
      slopScore,
      napkinRating,
      labels,
      verifiedGameDay: true,
      seasonLabel,
      note: noteValue ? noteValue.slice(0, 300) : null
    },
    create: {
      userId: user.id,
      foodItemId: foodItem.id,
      venueId: venue.id,
      gameDayKey,
      slopScore,
      napkinRating,
      labels,
      verifiedGameDay: true,
      seasonLabel,
      note: noteValue ? noteValue.slice(0, 300) : null
    }
  });

  redirect(`${itemPath}?review=saved`);
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

  const cookieStore = await cookies();
  const isSignedIn = hasMockUserAccess(
    cookieStore.get(MOCK_USER_COOKIE_NAME)?.value
  );
  const reviewPath = `/venues/${venue.slug}/${foodItem.slug}/review`;

  if (!isSignedIn) {
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
            <p className="brand-pill mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.15em]">
              Sign-in required
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Review {foodItem.name}
            </h1>
            <p className="mt-3 text-base text-zinc-300 sm:text-lg">
              {venue.name} · {venue.city}, {venue.state}
            </p>
          </header>

          <section className="brand-panel rounded-3xl border p-5 sm:p-6">
            <h2 className="text-2xl font-black sm:text-3xl">
              Sign in to submit a review
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Reviews belong to a reviewer profile so fans can trust who
              contributed the Slop Score, photos, and game-day signals. You can
              browse without signing in, but submitting reviews and marking
              helpful likes requires a profile.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/login?next=${encodeURIComponent(reviewPath)}`}
                className="brand-cta rounded-full px-6 py-4 text-center text-sm font-black transition"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-[var(--slop-line)] px-6 py-4 text-center text-sm font-black text-[var(--slop-cream)] transition hover:border-[var(--slop-blue)] hover:text-[var(--slop-blue)]"
              >
                Create profile
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-zinc-500">
              Temporary mock auth only. No real password security or database is
              connected yet.
            </p>
          </section>
        </section>
      </main>
    );
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

        <form action={submitReview} className="brand-panel rounded-3xl border p-4 sm:p-6">
          <input type="hidden" name="venueSlug" value={venue.slug} />
          <input type="hidden" name="foodSlug" value={foodItem.slug} />
          <div className="rounded-2xl bg-black p-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Mock signed in
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              This review will belong to your temporary reviewer profile. Real
              photo upload is not wired up yet.
            </p>
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
                name="note"
                maxLength={300}
                placeholder="Optional: hot, cold, worth it, messy, would run it back?"
                className="mt-3 min-h-24 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-zinc-400 outline-none placeholder:text-zinc-600"
              />
            </div>

            <div className="rounded-2xl bg-black p-4">
              <p className="text-sm font-bold text-zinc-300">
                Optional consensus label
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {consensusOptions.map((option) => (
                  <ConsensusOption
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="brand-cta mt-7 w-full rounded-full px-6 py-4 text-sm font-black"
          >
            Submit review
          </button>
        </form>

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
