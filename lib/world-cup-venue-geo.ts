/**
 * FIFA World Cup 2026 host venue geolocation for all 16 stadiums.
 * Composes NFL, MLS/NWSL, and Mexico registries into one canonical list.
 */

import { getMlsNwslVenueGeo } from "@/lib/mls-nwsl-venue-geo";
import { getNflVenueGeo } from "@/lib/nfl-venue-geo";
import {
  WORLD_CUP_VENUE_DISPLAY_NAMES,
  WORLD_CUP_VENUE_SLUGS,
  type WorldCupVenueSlug
} from "@/lib/schedules/world-cup-venue-map";

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

export const WORLD_CUP_RECURRING_EVENT = "FIFA World Cup 2026";

/** Mexico venues (also exported for ensure-world-cup-mexico-venues.ts). */
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

function geoFromRegistries(slug: WorldCupVenueSlug): WorldCupVenueGeo | undefined {
  const nfl = getNflVenueGeo(slug);
  if (nfl) {
    return {
      name: WORLD_CUP_VENUE_DISPLAY_NAMES[slug] ?? nfl.name,
      city: nfl.city,
      state: nfl.state,
      country: nfl.country,
      latitude: nfl.latitude,
      longitude: nfl.longitude,
      reviewRadiusMeters: nfl.reviewRadiusMeters,
      timeZone: nfl.timeZone
    };
  }

  const mls = getMlsNwslVenueGeo(slug);
  if (mls) {
    return {
      name: WORLD_CUP_VENUE_DISPLAY_NAMES[slug] ?? mls.name,
      city: mls.city,
      state: mls.state,
      country: mls.country,
      latitude: mls.latitude,
      longitude: mls.longitude,
      reviewRadiusMeters: mls.reviewRadiusMeters,
      timeZone: mls.timeZone
    };
  }

  return WORLD_CUP_MEXICO_VENUE_GEO[slug];
}

export const WORLD_CUP_HOST_VENUE_GEO: Record<WorldCupVenueSlug, WorldCupVenueGeo> =
  Object.fromEntries(
    WORLD_CUP_VENUE_SLUGS.map((slug) => {
      const geo = geoFromRegistries(slug);
      if (!geo) {
        throw new Error(`Missing World Cup geo profile for slug: ${slug}`);
      }
      return [slug, geo];
    })
  ) as Record<WorldCupVenueSlug, WorldCupVenueGeo>;

export function getWorldCupHostVenueGeo(slug: string): WorldCupVenueGeo | undefined {
  return WORLD_CUP_HOST_VENUE_GEO[slug.trim().toLowerCase() as WorldCupVenueSlug];
}

/** @deprecated Use getWorldCupHostVenueGeo */
export function getWorldCupMexicoVenueGeo(slug: string): WorldCupVenueGeo | undefined {
  return WORLD_CUP_MEXICO_VENUE_GEO[slug.trim().toLowerCase()];
}
