import Link from "next/link";

const STATE_FAIR_GUIDE_PATH = "/state-fair-food-guide";

export function HomeStateFairTeaser() {
  return (
    <section aria-label="State Fair Slop guide" className="home-state-fair-teaser">
      <Link href={STATE_FAIR_GUIDE_PATH} className="home-state-fair-teaser__link group">
        <div className="home-state-fair-teaser__copy">
          <p className="home-state-fair-teaser__eyebrow">Now tracking fair foods</p>
          <h2 className="home-state-fair-teaser__title">State Fair Slop</h2>
          <p className="home-state-fair-teaser__body">
            Browse early fair food guides built from public lists, preview items, and fan
            rankings as they grow.
          </p>
        </div>
        <span className="home-state-fair-teaser__cta">
          Browse fair foods
          <span className="home-state-fair-teaser__cta-arrow" aria-hidden>
            →
          </span>
        </span>
      </Link>
    </section>
  );
}
