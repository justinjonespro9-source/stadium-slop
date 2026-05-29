import type { Venue } from "@/lib/sample-data";

export type WorldCupHostCountry = "USA" | "Canada" | "Mexico";

export type WorldCupHostVenueDef = {
  id: string;
  name: string;
  market: string;
  country: WorldCupHostCountry;
  /** Slugs to match against `Venue.slug` from the database (first match wins). */
  slugCandidates: string[];
};

export type ResolvedWorldCupHostVenue = WorldCupHostVenueDef & {
  slug: string | null;
  venue: Venue | null;
  foodItemCount: number;
};

export { WORLD_CUP_GUIDE_PATH_EN as WORLD_CUP_GUIDE_PATH } from "@/lib/world-cup-stadium-food-guide-content";

export const WORLD_CUP_HOST_VENUES: WorldCupHostVenueDef[] = [
  {
    id: "metlife",
    name: "MetLife Stadium",
    market: "New York / New Jersey",
    country: "USA",
    slugCandidates: ["metlife-stadium", "met-life-stadium"]
  },
  {
    id: "sofi",
    name: "SoFi Stadium",
    market: "Los Angeles",
    country: "USA",
    slugCandidates: ["sofi-stadium", "so-fi-stadium", "hollywood-park"]
  },
  {
    id: "att",
    name: "AT&T Stadium",
    market: "Dallas",
    country: "USA",
    slugCandidates: ["att-stadium", "at-t-stadium"]
  },
  {
    id: "mercedes-benz",
    name: "Mercedes-Benz Stadium",
    market: "Atlanta",
    country: "USA",
    slugCandidates: ["mercedes-benz-stadium"]
  },
  {
    id: "nrg",
    name: "NRG Stadium",
    market: "Houston",
    country: "USA",
    slugCandidates: ["nrg-stadium", "reliant-stadium"]
  },
  {
    id: "arrowhead",
    name: "GEHA Field at Arrowhead Stadium",
    market: "Kansas City",
    country: "USA",
    slugCandidates: ["geha-field-at-arrowhead-stadium", "arrowhead-stadium"]
  },
  {
    id: "lincoln-financial",
    name: "Lincoln Financial Field",
    market: "Philadelphia",
    country: "USA",
    slugCandidates: ["lincoln-financial-field", "the-linc"]
  },
  {
    id: "lumen",
    name: "Lumen Field",
    market: "Seattle",
    country: "USA",
    slugCandidates: ["lumen-field"]
  },
  {
    id: "levis",
    name: "Levi's Stadium",
    market: "San Francisco Bay Area",
    country: "USA",
    slugCandidates: ["levi-s-stadium", "levis-stadium", "levi-stadium"]
  },
  {
    id: "hard-rock",
    name: "Hard Rock Stadium",
    market: "Miami",
    country: "USA",
    slugCandidates: ["hard-rock-stadium", "hardrock-stadium"]
  },
  {
    id: "gillette",
    name: "Gillette Stadium",
    market: "Boston",
    country: "USA",
    slugCandidates: ["gillette-stadium"]
  },
  {
    id: "bc-place",
    name: "BC Place",
    market: "Vancouver",
    country: "Canada",
    slugCandidates: ["bc-place"]
  },
  {
    id: "bmo-field",
    name: "BMO Field",
    market: "Toronto",
    country: "Canada",
    slugCandidates: ["bmo-field"]
  },
  {
    id: "azteca",
    name: "Estadio Azteca",
    market: "Mexico City",
    country: "Mexico",
    slugCandidates: ["estadio-azteca", "azteca"]
  },
  {
    id: "bbva",
    name: "Estadio BBVA",
    market: "Monterrey",
    country: "Mexico",
    slugCandidates: ["estadio-bbva", "bbva-stadium", "estadio-bbva-gnp"]
  },
  {
    id: "akron",
    name: "Estadio Akron",
    market: "Guadalajara",
    country: "Mexico",
    slugCandidates: ["estadio-akron", "akron-stadium", "estadio-chivas"]
  }
];

const COUNTRY_ORDER: WorldCupHostCountry[] = ["USA", "Canada", "Mexico"];

export function resolveWorldCupHostVenues(
  venues: Venue[],
  foodItemCountsByVenueSlug: Record<string, number> = {}
): ResolvedWorldCupHostVenue[] {
  const bySlug = new Map(venues.map((v) => [v.slug.toLowerCase(), v]));

  return WORLD_CUP_HOST_VENUES.map((host) => {
    const matchedSlug = host.slugCandidates.find((candidate) =>
      bySlug.has(candidate.toLowerCase())
    );
    const venue = matchedSlug ? bySlug.get(matchedSlug.toLowerCase()) ?? null : null;
    const slug = venue?.slug ?? null;
    const foodItemCount = slug ? (foodItemCountsByVenueSlug[slug] ?? 0) : 0;

    return {
      ...host,
      slug,
      venue: venue ?? null,
      foodItemCount
    };
  });
}

export function worldCupHostsByCountry(
  hosts: ResolvedWorldCupHostVenue[]
): { country: WorldCupHostCountry; hosts: ResolvedWorldCupHostVenue[] }[] {
  return COUNTRY_ORDER.map((country) => ({
    country,
    hosts: hosts.filter((h) => h.country === country)
  })).filter((group) => group.hosts.length > 0);
}
