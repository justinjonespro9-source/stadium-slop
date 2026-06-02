import "server-only";

import { teamM8tesAdFields } from "@/lib/team-m8tes-promo";

export type StaticAd = {
  id: string;
  placementKey: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sponsorName: string | null;
};

const TEAM_M8TES_BANNER = teamM8tesAdFields({ includeImage: true });
const TEAM_M8TES_INLINE = teamM8tesAdFields();

/** House ads from seed script — used when DB is unavailable or cache is cold. */
export const STATIC_AD_BY_PLACEMENT: Record<string, StaticAd> = {
  "home.featured.banner": {
    id: "static-home-featured",
    placementKey: "home.featured.banner",
    ...TEAM_M8TES_BANNER
  },
  "venue.sidebar": {
    id: "static-venue-sidebar",
    placementKey: "venue.sidebar",
    title: "Built by SNG LABS",
    body: "Fan-first products for sports, food, games, and live experiences.",
    ctaLabel: "Learn more",
    ctaHref: "/claim",
    sponsorName: "SNG LABS",
    imageUrl: null
  },
  "venue.mobile.inline": {
    id: "static-venue-mobile",
    placementKey: "venue.mobile.inline",
    ...TEAM_M8TES_INLINE
  },
  "item.detail.inline": {
    id: "static-item-inline",
    placementKey: "item.detail.inline",
    ...TEAM_M8TES_INLINE
  },
  "rankings.banner": {
    id: "static-rankings-banner",
    placementKey: "rankings.banner",
    title: "Built by SNG LABS",
    body: "Fan-first products for sports, food, games, and live experiences.",
    ctaLabel: "Learn more",
    ctaHref: "/claim",
    sponsorName: "SNG LABS",
    imageUrl: null
  },
  "worldcup.guide.banner": {
    id: "static-worldcup-banner",
    placementKey: "worldcup.guide.banner",
    ...TEAM_M8TES_BANNER
  },
  "review.confirmation": {
    id: "static-review-confirmation",
    placementKey: "review.confirmation",
    title: "Built by SNG LABS",
    body: "Fan-first products for sports, food, games, and live experiences.",
    ctaLabel: "Learn more",
    ctaHref: "/claim",
    sponsorName: "SNG LABS",
    imageUrl: null
  }
};
