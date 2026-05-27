/**
 * FIFA World Cup 2026 host venue geolocation (Mexico venues without NFL/MLS import rows).
 * Coordinates: stadium pitch center from OpenStreetMap / Wikidata.
 */

export type WorldCupVenueGeo = {
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  reviewRadiusMeters: number;
  timeZone: string;
};

export const WORLD_CUP_MEXICO_VENUE_GEO: Record<string, WorldCupVenueGeo> = {
  "estadio-azteca": {
    name: "Estadio Azteca",
    city: "Mexico City",
    state: "CDMX",
    country: "Mexico",
    latitude: 19.3029,
    longitude: -99.1505,
    reviewRadiusMeters: 1000,
    timeZone: "America/Mexico_City"
  },
  "estadio-bbva": {
    name: "Estadio BBVA",
    city: "Monterrey",
    state: "Nuevo León",
    country: "Mexico",
    latitude: 25.6866,
    longitude: -100.2444,
    reviewRadiusMeters: 1000,
    timeZone: "America/Monterrey"
  },
  "estadio-akron": {
    name: "Estadio Akron",
    city: "Guadalajara",
    state: "Jalisco",
    country: "Mexico",
    latitude: 20.6819,
    longitude: -103.4622,
    reviewRadiusMeters: 1000,
    timeZone: "America/Mexico_City"
  }
};

export function getWorldCupMexicoVenueGeo(slug: string): WorldCupVenueGeo | undefined {
  return WORLD_CUP_MEXICO_VENUE_GEO[slug.trim().toLowerCase()];
}
