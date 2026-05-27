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

export const WORLD_CUP_GUIDE_PATH = "/world-cup-stadium-food-guide";

export const WORLD_CUP_GUIDE_TITLE =
  "2026 World Cup Stadium Food Guide | Stadium Slop";

export const WORLD_CUP_GUIDE_DESCRIPTION =
  "Find food at 2026 World Cup host stadiums with Stadium Slop. Browse venue menus, fan photos, rankings, and verified in-stadium reviews.";

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

export const WORLD_CUP_HOW_IT_WORKS_STEPS = [
  {
    title: "Pick a host venue",
    body: "Choose a 2026 World Cup stadium to see what fans are eating inside the building."
  },
  {
    title: "Browse food items",
    body: "Explore menus, vendors, and standout bites before you head to your match."
  },
  {
    title: "See fan photos and rankings",
    body: "Compare Slop Scores, Napkin Ratings, and real photos from the stands."
  },
  {
    title: "Leave a verified in-stadium review",
    body: "Share a game-day review with location verification so rankings stay trustworthy."
  }
] as const;

export const WORLD_CUP_FAQ_ITEMS = [
  {
    question: "What is Stadium Slop?",
    answer:
      "Stadium Slop is a fan-powered guide to stadium food. Fans browse items, photos, and rankings, then leave verified in-stadium reviews to help others know what to order."
  },
  {
    question: "Which World Cup stadiums are on Stadium Slop?",
    answer:
      "This guide lists all sixteen confirmed host venues across the United States, Canada, and Mexico. Stadium pages go live on Stadium Slop as menus and reviews are added—check each card for availability."
  },
  {
    question: "Are Stadium Slop reviews official?",
    answer:
      "No. Reviews come from fans in the building, not from FIFA, teams, or venue operators. Stadium Slop is an independent platform."
  },
  {
    question: "How do verified in-stadium reviews work?",
    answer:
      "When you review food at a venue, Stadium Slop can confirm you are inside the stadium geofence on game day. That helps rankings reflect real fan experiences in the stands."
  },
  {
    question: "Can I use Stadium Slop before traveling to a match?",
    answer:
      "Yes. Browse host venues ahead of time to see what items exist, what fans rate highly, and what photos look like—so you can plan what to try once you arrive."
  }
] as const;

export const WORLD_CUP_PLATFORM_DISCLAIMER =
  "Stadium Slop is an independent fan platform and is not affiliated with or endorsed by FIFA or the FIFA World Cup.";

const COUNTRY_ORDER: WorldCupHostCountry[] = ["USA", "Canada", "Mexico"];

export function resolveWorldCupHostVenues(
  venues: Venue[],
  itemsByVenueSlug: Record<string, { length: number } | unknown[]>
): ResolvedWorldCupHostVenue[] {
  const bySlug = new Map(venues.map((v) => [v.slug.toLowerCase(), v]));

  return WORLD_CUP_HOST_VENUES.map((host) => {
    const matchedSlug = host.slugCandidates.find((candidate) =>
      bySlug.has(candidate.toLowerCase())
    );
    const venue = matchedSlug ? bySlug.get(matchedSlug.toLowerCase()) ?? null : null;
    const slug = venue?.slug ?? null;
    const items = slug ? itemsByVenueSlug[slug] : undefined;
    const foodItemCount = Array.isArray(items) ? items.length : 0;

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
