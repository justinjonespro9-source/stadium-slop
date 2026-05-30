import Link from "next/link";

import { StateFairDirectorySection } from "@/components/state-fair/state-fair-directory-section";
import { STATE_FAIR_DIRECTORY_DISCLAIMER } from "@/lib/state-fair-directory";

const FEATURE_CARDS = [
  {
    title: "Worth the Wait",
    body: "See which foods fans say are worth the line — not just the hype.",
    icon: "wait"
  },
  {
    title: "Fresh Takes",
    body: "Real opinions from people actually at the fair, when it matters most.",
    icon: "fresh"
  },
  {
    title: "Fair Favorites",
    body: "Track classics, new drops, and surprise winners across the grounds.",
    icon: "favorites"
  }
] as const;

const RANKING_CATEGORIES = [
  "Hot Today",
  "Fan Favorites",
  "Best New Foods",
  "Worth the Walk",
  "Sweet Tooth Standouts",
  "Savory Legends"
] as const;

const SLOP_NETWORK_ITEMS = [
  "State fairs",
  "Festivals",
  "Concerts",
  "Airports",
  "Theme parks"
] as const;

function FeatureIcon({ kind }: { kind: (typeof FEATURE_CARDS)[number]["icon"] }) {
  const className = "state-fair-feature-card__icon-svg";
  if (kind === "wait") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v5.5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "fresh") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
        <path
          d="M5 14c2-4 5-6 7-6s5 2 7 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M8 10.5h8M12 7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 4.5l2.1 4.5 4.9.7-3.5 3.4.8 4.9L12 15.8 7.7 17.9l.8-4.9-3.5-3.4 4.9-.7L12 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-7 pt-5 sm:px-6 sm:pb-8 sm:pt-6 lg:px-10">
          <Link href="/" className="media-venue-back-link inline-flex text-xs font-bold sm:text-sm">
            ← Stadium Slop home
          </Link>

          <header className="mt-3 max-w-3xl sm:mt-4">
            <p className="state-fair-guide-hero__eyebrow">State Fair Slop</p>
            <h1 className="mt-2 text-[clamp(1.55rem,5.2vw,2.65rem)] font-black leading-[1.08] tracking-tight text-white">
              Find the fair foods worth standing in line for.
            </h1>
            <p className="mt-3 max-w-2xl text-[0.8125rem] leading-relaxed text-white/78 sm:text-[0.9375rem]">
              From deep-fried classics to new fair-food drops, State Fair Slop helps fans find
              what&apos;s worth the walk, what&apos;s worth the wait, and what&apos;s better skipped.
            </p>
          </header>

          <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center">
            <span
              className="state-fair-guide-hero__cta-primary state-fair-guide-hero__cta-primary--soon"
              aria-disabled="true"
            >
              Coming soon
            </span>
            <Link href="/venues" className="state-fair-guide-hero__cta-secondary">
              Explore Stadium Slop
            </Link>
          </div>
        </div>
      </section>

      <div className="media-discovery-content">
        <section aria-labelledby="state-fair-why-heading">
          <p className="media-section-eyebrow">Why state fairs</p>
          <h2 id="state-fair-why-heading" className="media-section-title">
            Same Slop energy, new grounds
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.9375rem]">
            Stadium Slop was built for crowded venues, long lines, and strong opinions about
            overpriced food. State fairs are the same playbook — iconic vendors, seasonal drops,
            and endless &ldquo;is it worth it?&rdquo; debate. State Fair Slop extends fan-powered
            rankings to the midway.
          </p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {FEATURE_CARDS.map((card) => (
              <li key={card.title} className="state-fair-feature-card">
                <span className="state-fair-feature-card__icon" aria-hidden>
                  <FeatureIcon kind={card.icon} />
                </span>
                <h3 className="state-fair-feature-card__title">{card.title}</h3>
                <p className="state-fair-feature-card__body">{card.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <StateFairDirectorySection />

        <section className="mt-8 sm:mt-10" aria-labelledby="state-fair-rankings-heading">
          <div className="state-fair-rankings-panel">
            <p className="media-section-eyebrow">Preview</p>
            <h2 id="state-fair-rankings-heading" className="media-section-title">
              Coming Soon: Fair Food Rankings
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--media-ink-muted)]">
              Live boards for what&apos;s buzzing on the grounds — powered by fans, not marketing
              copy.
            </p>
            <ul className="state-fair-rankings-grid mt-5">
              {RANKING_CATEGORIES.map((category) => (
                <li key={category}>
                  <span className="state-fair-rank-chip">
                    <span className="state-fair-rank-chip__label">{category}</span>
                    <span className="state-fair-rank-chip__badge">Soon</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="state-fair-mn-panel mt-8 sm:mt-10"
          aria-labelledby="state-fair-mn-heading"
        >
          <p className="state-fair-mn-panel__eyebrow">First wedge</p>
          <h2 id="state-fair-mn-heading" className="state-fair-mn-panel__title">
            First stop: Minnesota State Fair
          </h2>
          <p className="state-fair-mn-panel__copy">
            The Great Minnesota Get-Together is built for this — iconic food, new releases every
            year, huge crowds, and endless debate over what is actually worth eating.
          </p>
          <p className="state-fair-mn-panel__disclaimer">{STATE_FAIR_DIRECTORY_DISCLAIMER}</p>
          <Link
            href="/venues/minnesota-state-fair"
            className="state-fair-mn-panel__cta media-primary-button mt-4 inline-flex px-5 py-2.5 text-sm"
          >
            View Minnesota guide
          </Link>
        </section>

        <section
          className="media-panel-card mt-8 p-5 sm:mt-10 sm:p-7"
          aria-labelledby="state-fair-network-heading"
        >
          <p className="media-section-eyebrow">Slop Network</p>
          <h2 id="state-fair-network-heading" className="media-section-title">
            Stadium Slop is just the beginning.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.9375rem]">
            State fairs, festivals, concerts, airports, and theme parks all have the same problem:
            too many options, not enough trustworthy real-time food feedback.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SLOP_NETWORK_ITEMS.map((item) => (
              <li key={item}>
                <span
                  className={
                    item === "State fairs"
                      ? "state-fair-network-chip state-fair-network-chip--active"
                      : "state-fair-network-chip"
                  }
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link href="/venues" className="media-primary-button px-6 py-3 text-sm">
              Browse stadium menus
            </Link>
            <Link href="/world-cup-stadium-food-guide" className="media-cta-outline px-6 py-3 text-sm">
              World Cup stadium food guide
            </Link>
          </div>
        </section>

        <p className="mt-8 text-center text-xs leading-relaxed text-[var(--media-ink-dim)] sm:text-sm">
          State Fair Slop is a preview experience from Stadium Slop.{" "}
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
