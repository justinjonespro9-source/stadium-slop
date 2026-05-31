import Link from "next/link";

import { StateFairDirectorySection } from "@/components/state-fair/state-fair-directory-section";

const HOW_IT_WORKS_COPY =
  "Choose a fair to browse food listings, fair-specific filters, and early rankings. Listings are based on public preview sources and may change as official food finders update.";

const PAGE_DISCLAIMER =
  "Unofficial fan-powered guide. Food and vendor listings may change. Not affiliated with or endorsed by any state fair.";

export function StateFairFoodGuidePage() {
  return (
    <main className="media-page-shell state-fair-guide min-h-screen">
      <section className="state-fair-guide-hero relative overflow-hidden text-white">
        <div className="state-fair-guide-hero__glow" aria-hidden />
        <div className="state-fair-guide-hero__lights" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-12 bg-gradient-to-b from-transparent to-[var(--media-surface)] sm:h-14"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 sm:pb-9 sm:pt-6 lg:px-10">
          <Link href="/" className="media-venue-back-link inline-flex text-xs font-bold sm:text-sm">
            ← Stadium Slop home
          </Link>

          <header className="mt-3 max-w-3xl sm:mt-4">
            <p className="state-fair-guide-hero__eyebrow">State Fair Slop</p>
            <h1 className="mt-2 text-[clamp(1.55rem,5.2vw,2.65rem)] font-black leading-[1.08] tracking-tight text-white">
              Find the fair foods worth standing in line for.
            </h1>
            <p className="mt-3 max-w-2xl text-[0.8125rem] leading-relaxed text-white/78 sm:text-[0.9375rem]">
              Browse early fair food guides built from public food lists, preview items, and
              fan-powered rankings as they grow.
            </p>
          </header>
        </div>
      </section>

      <div className="media-discovery-content">
        <StateFairDirectorySection />

        <section
          className="state-fair-guide-how-it-works mt-6 sm:mt-8"
          aria-labelledby="state-fair-how-heading"
        >
          <h2 id="state-fair-how-heading" className="sr-only">
            How State Fair Slop works
          </h2>
          <p className="state-fair-guide-how-it-works__copy">{HOW_IT_WORKS_COPY}</p>
        </section>

        <p className="state-fair-guide-page-disclaimer mt-6 text-center text-xs leading-relaxed text-[var(--media-ink-dim)] sm:mt-8 sm:text-sm">
          {PAGE_DISCLAIMER}{" "}
          <Link
            href="/disclaimer"
            className="font-bold text-[var(--media-orange-deep)] hover:text-[var(--media-orange)]"
          >
            Read our disclaimer
          </Link>
        </p>
      </div>
    </main>
  );
}
