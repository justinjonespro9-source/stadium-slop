import type { Metadata } from "next";

import { AdSlot } from "@/components/ads/ad-slot";
import { HomeFeaturedSections } from "@/components/home/home-featured-sections";
import { HomeScorecardExample } from "@/components/home/home-scorecard-example";
import { HomeHero } from "@/components/home/home-hero";
import { HomePopularSearches } from "@/components/home/home-popular-searches";
import { HomeStateFairTeaser } from "@/components/home/home-state-fair-teaser";
import { HomeStatBand } from "@/components/home/home-stat-band";
import { HomeSlopNetwork } from "@/components/home-slop-network";
import { HomeVenueSearch } from "@/components/home-venue-search";
import { getHomepageRecentlyAddedItems, getHomepageStats } from "@/lib/homepage-data";
import { getPublicVenues } from "@/lib/public-data";
import { withPublicRouteTiming } from "@/lib/route-timing";
import {
  getAbsoluteUrl,
  OG_CARD,
  SITE_HOME_DESCRIPTION,
  SITE_HOME_OG_ALT,
  SITE_HOME_TITLE
} from "@/lib/site-metadata";

export const revalidate = 300;

const homeOgImage = {
  url: "/opengraph-image",
  width: OG_CARD.width,
  height: OG_CARD.height,
  alt: SITE_HOME_OG_ALT
} as const;

export const metadata: Metadata = {
  title: SITE_HOME_TITLE,
  description: SITE_HOME_DESCRIPTION,
  openGraph: {
    title: SITE_HOME_TITLE,
    description: SITE_HOME_DESCRIPTION,
    url: getAbsoluteUrl("/"),
    images: [homeOgImage]
  },
  twitter: {
    title: SITE_HOME_TITLE,
    description: SITE_HOME_DESCRIPTION,
    images: [homeOgImage.url]
  }
};

export default async function Home() {
  return withPublicRouteTiming("homepage", async () => {
    const [venues, stats, recentlyAdded] = await Promise.all([
    getPublicVenues(),
    getHomepageStats(),
    getHomepageRecentlyAddedItems(6)
  ]);

  return (
    <main className="media-page-shell media-home min-h-screen">
      <HomeHero>
        <HomeVenueSearch venues={venues} variant="hero" />
        <HomePopularSearches />
      </HomeHero>

      <div className="media-home-content mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
        <HomeStatBand stats={stats} />

        <div className="mt-6 sm:mt-8">
          <AdSlot
            placementKey="home.featured.banner"
            variant="banner"
            tone="media"
            label="Sponsored"
          />
        </div>

        <div className="mt-5 sm:mt-6">
          <HomeStateFairTeaser />
        </div>

        <HomeScorecardExample />

        <HomeFeaturedSections recentlyAdded={recentlyAdded} />

        <div className="mt-10 border-t border-[var(--media-border)] pt-8 sm:mt-12">
          <HomeSlopNetwork variant="media" />
        </div>
      </div>
    </main>
  );
  });
}
