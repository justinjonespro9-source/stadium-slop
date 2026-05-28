import type { Metadata } from "next";

import { AdSlot } from "@/components/ads/ad-slot";
import { HomeFeaturedSections } from "@/components/home/home-featured-sections";
import { HomeHero } from "@/components/home/home-hero";
import { HomePopularSearches } from "@/components/home/home-popular-searches";
import { HomeStatBand } from "@/components/home/home-stat-band";
import { HomeSlopNetwork } from "@/components/home-slop-network";
import { HomeVenueSearch } from "@/components/home-venue-search";
import {
  getHomepageFanFavoriteItems,
  getHomepageRecentlyAddedItems,
  getHomepageStats,
  getHomepageTopSlopItems
} from "@/lib/homepage-data";
import { getPublicVenues } from "@/lib/public-data";
import { getAbsoluteUrl, SITE_TAGLINE_SHORT } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Find the best eats at every stadium. Real fans, real reviews, and fan-powered Slop Score rankings on Stadium Slop.",
  openGraph: {
    title: `Stadium Slop — Find the best eats at every stadium`,
    description: SITE_TAGLINE_SHORT,
    url: getAbsoluteUrl("/")
  },
  twitter: {
    title: `Stadium Slop — Find the best eats at every stadium`,
    description: SITE_TAGLINE_SHORT
  }
};

export default async function Home() {
  const [venues, stats, topSlop, recentlyAdded, fanFavorites] = await Promise.all([
    getPublicVenues(),
    getHomepageStats(),
    getHomepageTopSlopItems(6),
    getHomepageRecentlyAddedItems(6),
    getHomepageFanFavoriteItems(6)
  ]);

  return (
    <main className="brand-page min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-10">
        <HomeHero>
          <HomeVenueSearch venues={venues} variant="hero" />
          <HomePopularSearches />
        </HomeHero>

        <div className="mt-6 sm:mt-8">
          <HomeStatBand stats={stats} />
        </div>

        <div className="mt-5 sm:mt-6">
          <AdSlot
            placementKey="home.featured.banner"
            variant="banner"
            label="Sponsored"
          />
        </div>

        <HomeFeaturedSections
          topSlop={topSlop}
          recentlyAdded={recentlyAdded}
          fanFavorites={fanFavorites}
        />

        <div className="mt-10 border-t border-[var(--slop-line-strong)] pt-8 sm:mt-12">
          <HomeSlopNetwork />
        </div>
      </div>
    </main>
  );
}
