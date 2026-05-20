/** Canonical WGS84 coordinates for flagship MLB venues (game-day certification). */
export const GAME_DAY_FLAGSHIP_VENUE_COORDS = [
  {
    slug: "target-field",
    latitude: 44.9817,
    longitude: -93.2776,
    reviewRadiusMeters: 800
  },
  {
    slug: "wrigley-field",
    latitude: 41.9484,
    longitude: -87.6553,
    reviewRadiusMeters: 800
  },
  {
    slug: "yankee-stadium",
    latitude: 40.8296,
    longitude: -73.9265,
    reviewRadiusMeters: 800
  },
  {
    slug: "dodger-stadium",
    latitude: 34.0737,
    longitude: -118.24,
    reviewRadiusMeters: 800
  }
] as const;
