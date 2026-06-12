/**
 * FIFA World Cup 2026 host venue name → Stadium Slop slug mapping.
 */

import { WORLD_CUP_HOST_VENUES } from "@/lib/world-cup-stadium-food-guide";

/** Canonical slug for each of the 16 host stadiums. */
export const WORLD_CUP_VENUE_SLUGS = [
  "metlife-stadium",
  "sofi-stadium",
  "att-stadium",
  "mercedes-benz-stadium",
  "nrg-stadium",
  "geha-field-at-arrowhead-stadium",
  "lincoln-financial-field",
  "lumen-field",
  "levi-s-stadium",
  "hard-rock-stadium",
  "gillette-stadium",
  "bc-place",
  "bmo-field",
  "estadio-azteca",
  "estadio-bbva",
  "estadio-akron"
] as const;

export type WorldCupVenueSlug = (typeof WORLD_CUP_VENUE_SLUGS)[number];

/** FIFA / media venue labels → canonical slug. */
const VENUE_NAME_TO_SLUG: Record<string, WorldCupVenueSlug> = {
  "metlife stadium": "metlife-stadium",
  "new york new jersey stadium": "metlife-stadium",
  "new york / new jersey stadium": "metlife-stadium",
  "sofi stadium": "sofi-stadium",
  "los angeles stadium": "sofi-stadium",
  "at&t stadium": "att-stadium",
  "dallas stadium": "att-stadium",
  "mercedes-benz stadium": "mercedes-benz-stadium",
  "atlanta stadium": "mercedes-benz-stadium",
  "nrg stadium": "nrg-stadium",
  "houston stadium": "nrg-stadium",
  "geha field at arrowhead stadium": "geha-field-at-arrowhead-stadium",
  "arrowhead stadium": "geha-field-at-arrowhead-stadium",
  "kansas city stadium": "geha-field-at-arrowhead-stadium",
  "lincoln financial field": "lincoln-financial-field",
  "philadelphia stadium": "lincoln-financial-field",
  "lumen field": "lumen-field",
  "seattle stadium": "lumen-field",
  "levi's stadium": "levi-s-stadium",
  "levis stadium": "levi-s-stadium",
  "san francisco bay area stadium": "levi-s-stadium",
  "hard rock stadium": "hard-rock-stadium",
  "miami stadium": "hard-rock-stadium",
  "gillette stadium": "gillette-stadium",
  "boston stadium": "gillette-stadium",
  "bc place": "bc-place",
  "vancouver stadium": "bc-place",
  "bmo field": "bmo-field",
  "toronto stadium": "bmo-field",
  "estadio azteca": "estadio-azteca",
  "mexico city stadium": "estadio-azteca",
  "estadio bbva": "estadio-bbva",
  "monterrey stadium": "estadio-bbva",
  "estadio akron": "estadio-akron",
  "guadalajara stadium": "estadio-akron"
};

/** Display name for each canonical slug. */
export const WORLD_CUP_VENUE_DISPLAY_NAMES: Record<WorldCupVenueSlug, string> = {
  "metlife-stadium": "MetLife Stadium",
  "sofi-stadium": "SoFi Stadium",
  "att-stadium": "AT&T Stadium",
  "mercedes-benz-stadium": "Mercedes-Benz Stadium",
  "nrg-stadium": "NRG Stadium",
  "geha-field-at-arrowhead-stadium": "GEHA Field at Arrowhead Stadium",
  "lincoln-financial-field": "Lincoln Financial Field",
  "lumen-field": "Lumen Field",
  "levi-s-stadium": "Levi's Stadium",
  "hard-rock-stadium": "Hard Rock Stadium",
  "gillette-stadium": "Gillette Stadium",
  "bc-place": "BC Place",
  "bmo-field": "BMO Field",
  "estadio-azteca": "Estadio Azteca",
  "estadio-bbva": "Estadio BBVA",
  "estadio-akron": "Estadio Akron"
};

function normalizeVenueKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Resolve a FIFA/media venue label or slug to a canonical host slug. */
export function resolveWorldCupVenueSlug(
  venueNameOrSlug: string
): WorldCupVenueSlug | null {
  const raw = venueNameOrSlug.trim().toLowerCase();
  if ((WORLD_CUP_VENUE_SLUGS as readonly string[]).includes(raw)) {
    return raw as WorldCupVenueSlug;
  }

  const fromName = VENUE_NAME_TO_SLUG[normalizeVenueKey(venueNameOrSlug)];
  if (fromName) return fromName;

  for (const host of WORLD_CUP_HOST_VENUES) {
    if (host.slugCandidates.some((s) => s.toLowerCase() === raw)) {
      return host.slugCandidates[0] as WorldCupVenueSlug;
    }
    if (normalizeVenueKey(host.name) === normalizeVenueKey(venueNameOrSlug)) {
      return host.slugCandidates[0] as WorldCupVenueSlug;
    }
  }

  return null;
}

export function isWorldCupVenueSlug(slug: string): slug is WorldCupVenueSlug {
  return (WORLD_CUP_VENUE_SLUGS as readonly string[]).includes(slug);
}
