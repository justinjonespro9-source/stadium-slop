import Link from "next/link";

import { DiscoveryPageHero } from "@/components/discovery/discovery-page-hero";

const DIFFERENTIATORS = [
  {
    title: "Verified at the venue",
    body: "Reviews can be tied to on-site check-ins so scores reflect food eaten in the building, not armchair takes."
  },
  {
    title: "Food photos from real visitors",
    body: "See what orders actually look like in the stands — portions, presentation, and fair-day reality."
  },
  {
    title: "Slop Score rankings",
    body: "Compare items by fan-rated Slop Score so the best bites rise above the loudest signage."
  },
  {
    title: "Napkin Rating and mess signals",
    body: "Mess and portability matter when you are eating in your lap. Napkin Rating helps set expectations."
  },
  {
    title: "Fresh takes during live events",
    body: "Game-day and event-season views surface what fans are rating right now, not last year’s highlight reel."
  },
  {
    title: "Vendor and venue claim tools",
    body: "Operators can claim listings to help keep menus, locations, and stand details accurate over time."
  }
] as const;

const SLOP_NETWORK_LINKS = [
  { href: "/venues", label: "Stadium venues" },
  { href: "/state-fair-food-guide", label: "State Fair Slop" }
] as const;

const UNOFFICIAL_DISCLAIMER =
  "Stadium Slop is independent and fan-powered. Listings may be based on public sources and user submissions. We are not affiliated with or endorsed by teams, leagues, venues, fairs, FIFA, or event operators unless specifically stated.";

export function AboutPage() {
  return (
    <main className="media-page-shell about-page min-h-screen">
      <DiscoveryPageHero
        backHref="/"
        backLabel="Stadium Slop home"
        eyebrow="About Stadium Slop"
        title="Food reviews for the places where game day, fair day, and live events actually happen."
        description="Stadium Slop is a fan-powered food guide built around real venues, real crowds, and real food decisions — from stadium concessions to state fair classics."
      />

      <div className="media-discovery-content">
        <section className="about-page__section" aria-labelledby="about-problem-heading">
          <h2 id="about-problem-heading" className="media-section-title">
            Concession food moves fast.
          </h2>
          <p className="about-page__copy mt-3 max-w-3xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.9375rem]">
            Menus change. Prices change. Portions change. And the best bite in the building
            is not always the one with the biggest sign. Stadium Slop helps people see what
            is worth the walk, worth the wait, and worth the price before they order.
          </p>
        </section>

        <section
          className="about-page__section mt-8 sm:mt-10"
          aria-labelledby="about-different-heading"
        >
          <p className="media-section-eyebrow">What makes it different</p>
          <h2 id="about-different-heading" className="media-section-title">
            Built for live-event food decisions
          </h2>
          <ul className="about-page__card-grid mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATORS.map((item) => (
              <li key={item.title} className="media-panel-card about-page__card p-4 sm:p-5">
                <h3 className="text-sm font-black leading-snug text-[var(--media-ink)] sm:text-[0.9375rem]">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--media-ink-muted)] sm:text-sm">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="about-page__section mt-8 sm:mt-10"
          aria-labelledby="about-network-heading"
        >
          <p className="media-section-eyebrow">The Slop Network</p>
          <h2 id="about-network-heading" className="media-section-title">
            Stadium Slop is the flagship.
          </h2>
          <p className="about-page__copy mt-3 max-w-3xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.9375rem]">
            State Fair Slop is an early extension of the same idea: food
            discovery built for live-event environments where timing, location, and crowd
            feedback matter.
          </p>
          <nav
            className="about-page__network-links mt-4 flex flex-wrap gap-2"
            aria-label="Slop Network guides"
          >
            {SLOP_NETWORK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="media-hero-pill px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm"
              >
                {link.label} →
              </Link>
            ))}
          </nav>
        </section>

        <section className="about-page__section mt-8 sm:mt-10" aria-labelledby="about-disclaimer-heading">
          <h2 id="about-disclaimer-heading" className="sr-only">
            Independent disclaimer
          </h2>
          <p className="about-page__disclaimer media-panel-card px-4 py-4 text-xs leading-relaxed text-[var(--media-ink-muted)] sm:px-5 sm:py-5 sm:text-sm">
            {UNOFFICIAL_DISCLAIMER}{" "}
            <Link
              href="/disclaimer"
              className="font-bold text-[var(--media-orange-deep)] hover:text-[var(--media-orange)]"
            >
              Read our disclaimer
            </Link>
          </p>
        </section>

        <section
          className="about-page__section about-page__cta mt-8 sm:mt-10"
          aria-labelledby="about-claim-heading"
        >
          <div className="media-panel-card media-panel-card--accent px-4 py-5 sm:px-6 sm:py-6">
            <h2 id="about-claim-heading" className="media-section-title">
              Represent a venue, vendor, or stand?
            </h2>
            <p className="about-page__copy mt-2 max-w-2xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.9375rem]">
              Claim a listing to help keep menus, locations, and details accurate.
            </p>
            <Link href="/claim" className="about-page__cta-btn mt-4 inline-flex">
              Claim a listing
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
