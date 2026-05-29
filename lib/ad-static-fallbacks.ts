import "server-only";

import { resolveTeamM8tesPosterUrl } from "@/lib/media-assets";

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

/** House ads from seed script — used when DB is unavailable or cache is cold. */
export const STATIC_AD_BY_PLACEMENT: Record<string, StaticAd> = {
  "home.featured.banner": {
    id: "static-home-featured",
    placementKey: "home.featured.banner",
    title: "Single sports fan? Find your Team-M8.",
    body: "Connect with fans who love your teams as much as you do.",
    ctaLabel: "Find your M8",
    ctaHref: "https://team-m8tes.com",
    sponsorName: "Team-M8tes",
    imageUrl: resolveTeamM8tesPosterUrl()
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
    title: "Single sports fan? Find your Team-M8.",
    body: "Connect with fans who love your teams as much as you do.",
    ctaLabel: "Find your M8",
    ctaHref: "https://team-m8tes.com",
    sponsorName: "Team-M8tes",
    imageUrl: null
  },
  "item.detail.inline": {
    id: "static-item-inline",
    placementKey: "item.detail.inline",
    title: "Single sports fan? Find your Team-M8.",
    body: "Connect with fans who love your teams as much as you do.",
    ctaLabel: "Find your M8",
    ctaHref: "https://team-m8tes.com",
    sponsorName: "Team-M8tes",
    imageUrl: null
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
    title: "Single sports fan? Find your Team-M8.",
    body: "Connect with fans who love your teams as much as you do.",
    ctaLabel: "Find your M8",
    ctaHref: "https://team-m8tes.com",
    sponsorName: "Team-M8tes",
    imageUrl: null
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
