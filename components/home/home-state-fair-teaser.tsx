import Link from "next/link";

const STATE_FAIR_GUIDE_PATH = "/state-fair-food-guide";

export function HomeStateFairTeaser() {
  return (
    <section aria-label="State Fair Slop preview" className="home-state-fair-teaser">
      <Link href={STATE_FAIR_GUIDE_PATH} className="home-state-fair-teaser__link group">
        <div className="home-state-fair-teaser__copy">
          <p className="home-state-fair-teaser__eyebrow">Coming next</p>
          <h2 className="home-state-fair-teaser__title">State Fair Slop</h2>
          <p className="home-state-fair-teaser__body">
            A fan-powered guide to the fair foods worth standing in line for.
          </p>
        </div>
        <span className="home-state-fair-teaser__cta">
          Preview State Fair Slop
          <span className="home-state-fair-teaser__cta-arrow" aria-hidden>
            →
          </span>
        </span>
      </Link>
    </section>
  );
}
