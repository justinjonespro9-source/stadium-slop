import type { FairVenueDefinition } from "./types";

export const FAIR_VENUE_SLUGS = [
  "minnesota-state-fair",
  "iowa-state-fair",
  "state-fair-of-texas",
  "wisconsin-state-fair",
  "the-big-e"
] as const;

export type FairVenueSlug = (typeof FAIR_VENUE_SLUGS)[number];

export function isFairVenueSlug(slug: string): slug is FairVenueSlug {
  return (FAIR_VENUE_SLUGS as readonly string[]).includes(slug);
}

/** Active fairgrounds — browseable as venues with preview menu data. */
export const FAIR_VENUE_DEFINITIONS: FairVenueDefinition[] = [
  {
    slug: "minnesota-state-fair",
    name: "Minnesota State Fair",
    city: "Saint Paul",
    state: "MN",
    country: "USA",
    latitude: 44.9789,
    longitude: -93.1808,
    reviewRadiusMeters: 1200,
    recurringEvents: ["Minnesota State Fair"]
  },
  {
    slug: "iowa-state-fair",
    name: "Iowa State Fair",
    city: "Des Moines",
    state: "IA",
    country: "USA",
    latitude: 41.5759,
    longitude: -93.5708,
    reviewRadiusMeters: 1200,
    recurringEvents: ["Iowa State Fair"]
  },
  {
    slug: "state-fair-of-texas",
    name: "State Fair of Texas",
    city: "Dallas",
    state: "TX",
    country: "USA",
    latitude: 32.7794,
    longitude: -96.7651,
    reviewRadiusMeters: 1400,
    recurringEvents: ["State Fair of Texas"]
  },
  {
    slug: "wisconsin-state-fair",
    name: "Wisconsin State Fair",
    city: "West Allis",
    state: "WI",
    country: "USA",
    latitude: 43.0112,
    longitude: -88.0074,
    reviewRadiusMeters: 1200,
    recurringEvents: ["Wisconsin State Fair"]
  },
  {
    slug: "the-big-e",
    name: "The Big E",
    city: "West Springfield",
    state: "MA",
    country: "USA",
    latitude: 42.1065,
    longitude: -72.5856,
    reviewRadiusMeters: 1100,
    recurringEvents: ["The Big E"]
  }
];

export function getFairVenueDefinition(slug: string): FairVenueDefinition | undefined {
  return FAIR_VENUE_DEFINITIONS.find((v) => v.slug === slug);
}
