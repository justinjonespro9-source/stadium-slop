import {
  HOME_SCORECARD_FEATURE_NOTES,
  HOME_SCORECARD_TRUST_TAGLINE
} from "@/lib/home-scorecard-example";

import { HomeScorecardFlipExample } from "@/components/home/home-scorecard-flip-example";

export function HomeScorecardExample() {
  return (
    <section
      className="home-scorecard-example mt-10 sm:mt-12"
      aria-labelledby="home-scorecard-example-heading"
    >
      <div className="media-section-heading">
        <div className="min-w-0">
          <p className="media-section-eyebrow">Slop Scorecard</p>
          <h2 id="home-scorecard-example-heading" className="media-section-title">
            How a Slop Scorecard works
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.9375rem]">
            Every review turns into a quick-read food card with a Slop Score, food photo, napkin
            rating, replay value, price check, and a hot take from the crowd.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="home-scorecard-example__badge">Example Scorecard</span>
        <span className="home-scorecard-example__badge home-scorecard-example__badge--muted">
          Illustrative only. Not a live review.
        </span>
      </div>

      <div className="home-scorecard-example__showcase mt-4">
        <div className="home-scorecard-example__showcase-aside min-w-0">
          <p className="home-scorecard-example__trust-line text-xs font-bold leading-snug text-[var(--media-orange-deep)] sm:text-[0.8125rem]">
            {HOME_SCORECARD_TRUST_TAGLINE}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[var(--media-ink-muted)] sm:text-sm">
            Flip once to see Slop Signals on the back: napkin rating, replay value, price check,
            and a hot take.
          </p>
        </div>
        <HomeScorecardFlipExample />
      </div>

      <ul
        className="home-scorecard-example__features mt-4"
        aria-label="How Stadium Slop reviews work"
      >
        {HOME_SCORECARD_FEATURE_NOTES.map((note) => (
          <li key={note.title} className="home-scorecard-example__feature">
            <p className="home-scorecard-example__feature-title">{note.title}</p>
            <p className="home-scorecard-example__feature-body">{note.body}</p>
          </li>
        ))}
      </ul>

      <p className="home-scorecard-example__disclaimer mt-4 max-w-2xl text-xs leading-relaxed text-[var(--media-ink-dim)] sm:text-sm">
        Example only. Real scorecards come from reviews submitted at the venue. Rankings and
        Top Slop lists stay on each venue&apos;s page.
      </p>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[var(--media-ink-dim)]">
        Other bites fans review include fair classics like Fairground Cheese Curds or stadium
        staples like Spicy Chicken Sandwich.
      </p>
    </section>
  );
}
