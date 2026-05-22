import Link from "next/link";
import { notFound } from "next/navigation";

import {
  demoScorecardItemPath,
  isDevDemoScorecardsEnabled,
  resolveDemoScorecardTargetFromEnv
} from "@/lib/dev-demo-scorecards";

export const dynamic = "force-dynamic";

export default function DevDemoScorecardsPage() {
  if (!isDevDemoScorecardsEnabled()) {
    notFound();
  }

  const { venueSlug, foodSlug } = resolveDemoScorecardTargetFromEnv();
  const itemPath = demoScorecardItemPath(venueSlug, foodSlug);

  return (
    <main className="brand-page min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg rounded-2xl border border-[var(--slop-line-strong)] bg-[color:rgba(11,27,43,0.92)] p-5 shadow-[var(--slop-shadow-card)]">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--slop-gold-dim)]">
          Development only
        </p>
        <h1 className="mt-1 text-2xl font-black text-[var(--slop-cream)]">
          Slop Scorecard testing
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
          Seed three sample scorecards on an existing MLB menu item, then browse the
          flip/Rolodex UI without venue check-in. Production review submission rules
          are unchanged.
        </p>

        <section className="mt-4 space-y-2 rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.55)] p-3 text-sm text-[var(--slop-cream-muted)]">
          <p className="font-bold text-[var(--slop-cream)]">1. Seed fixtures</p>
          <code className="block rounded-lg bg-black/60 px-2 py-1.5 text-xs text-[var(--slop-gold-bright)]">
            npm run seed:demo-scorecards
          </code>
          <p className="text-xs">
            Optional:{" "}
            <code className="text-[var(--slop-cream-dim)]">
              DEMO_SCORECARD_VENUE_SLUG
            </code>{" "}
            /{" "}
            <code className="text-[var(--slop-cream-dim)]">
              DEMO_SCORECARD_FOOD_SLUG
            </code>
          </p>
        </section>

        <section className="mt-3 space-y-2 rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.55)] p-3 text-sm text-[var(--slop-cream-muted)]">
          <p className="font-bold text-[var(--slop-cream)]">2. View scorecards</p>
          <p className="text-xs">
            Default target:{" "}
            <span className="font-semibold text-[var(--slop-cream)]">
              {venueSlug}
            </span>{" "}
            ·{" "}
            <span className="font-semibold text-[var(--slop-cream)]">
              {foodSlug}
            </span>
          </p>
          <Link
            href={itemPath}
            className="brand-cta mt-2 inline-flex w-full justify-center rounded-full px-4 py-3 text-sm font-black"
          >
            Open item scorecards
          </Link>
        </section>

        <section className="mt-3 rounded-xl border border-amber-800/50 bg-amber-950/30 p-3 text-xs leading-relaxed text-amber-100/90">
          <p className="font-bold text-amber-100">Why older cards vanished</p>
          <p className="mt-1">
            The carousel only lists reviews with an ACTIVE fan photo that has a public
            image URL or a placeholder emoji. Demo-density seed rows often set{" "}
            <code className="text-amber-200/80">url: null</code> — those reviews still
            count in stats but were excluded from the Rolodex until placeholder-backed
            cards were included.
          </p>
        </section>

        <p className="mt-4 text-center text-[0.65rem] text-[var(--slop-cream-dim)]">
          <Link href="/venues" className="underline hover:text-[var(--slop-cream)]">
            ← Venues
          </Link>
        </p>
      </div>
    </main>
  );
}
