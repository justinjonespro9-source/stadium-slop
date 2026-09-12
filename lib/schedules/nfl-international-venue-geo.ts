/**
 * Neutral-site / NFL International Series venues for 2026.
 *
 * Coordinates: stadium pitch/center from Wikipedia / OSM (same convention as
 * `lib/nfl-venue-geo.ts`). Estadio Azteca already exists as a World Cup host —
 * map ESPN "Estadio Banorte" there; do not create a duplicate.
 */

export type NflInternationalVenueGeo = {
  name: string;
  city: string;
  state: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  timeZone: string;
};

/** Slugs that must be created (or already exist) for 2026 international games. */
export const NFL_INTERNATIONAL_VENUE_GEO: Record<string, NflInternationalVenueGeo> =
  {
    "melbourne-cricket-ground": {
      name: "Melbourne Cricket Ground",
      city: "Melbourne",
      state: "VIC",
      country: "Australia",
      region: "Oceania",
      latitude: -37.82,
      longitude: 144.9834,
      reviewRadiusMeters: 1000,
      timeZone: "Australia/Melbourne"
    },
    "maracana-stadium": {
      name: "Maracanã Stadium",
      city: "Rio de Janeiro",
      state: "RJ",
      country: "Brazil",
      region: "South America",
      latitude: -22.9121,
      longitude: -43.2302,
      reviewRadiusMeters: 1000,
      timeZone: "America/Sao_Paulo"
    },
    "tottenham-hotspur-stadium": {
      name: "Tottenham Hotspur Stadium",
      city: "London",
      state: "ENG",
      country: "United Kingdom",
      region: "Europe",
      latitude: 51.6042,
      longitude: -0.0662,
      reviewRadiusMeters: 1000,
      timeZone: "Europe/London"
    },
    "wembley-stadium": {
      name: "Wembley Stadium",
      city: "London",
      state: "ENG",
      country: "United Kingdom",
      region: "Europe",
      latitude: 51.5558,
      longitude: -0.2796,
      reviewRadiusMeters: 1000,
      timeZone: "Europe/London"
    },
    "stade-de-france": {
      name: "Stade de France",
      city: "Saint-Denis",
      state: "IDF",
      country: "France",
      region: "Europe",
      latitude: 48.9245,
      longitude: 2.3601,
      reviewRadiusMeters: 1000,
      timeZone: "Europe/Paris"
    },
    "santiago-bernabeu": {
      name: "Santiago Bernabéu",
      city: "Madrid",
      state: "MD",
      country: "Spain",
      region: "Europe",
      latitude: 40.4531,
      longitude: -3.6883,
      reviewRadiusMeters: 1000,
      timeZone: "Europe/Madrid"
    },
    "fc-bayern-munich-stadium": {
      name: "FC Bayern Munich Stadium",
      city: "Munich",
      state: "BY",
      country: "Germany",
      region: "Europe",
      latitude: 48.2188,
      longitude: 11.6247,
      reviewRadiusMeters: 1000,
      timeZone: "Europe/Berlin"
    }
  };

/** Existing World Cup venue — ESPN lists the 2026 Mexico NFL game as Estadio Banorte. */
export const NFL_MEXICO_CITY_VENUE_SLUG = "estadio-azteca";

export const NFL_INTERNATIONAL_VENUE_TIME_ZONES: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(NFL_INTERNATIONAL_VENUE_GEO).map(([slug, geo]) => [
      slug,
      geo.timeZone
    ])
  ),
  [NFL_MEXICO_CITY_VENUE_SLUG]: "America/Mexico_City"
};

export const NFL_INTERNATIONAL_VENUE_SLUGS = new Set<string>([
  ...Object.keys(NFL_INTERNATIONAL_VENUE_GEO),
  NFL_MEXICO_CITY_VENUE_SLUG
]);

export function getNflInternationalVenueGeo(
  slug: string
): NflInternationalVenueGeo | undefined {
  return NFL_INTERNATIONAL_VENUE_GEO[slug.trim().toLowerCase()];
}
