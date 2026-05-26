import type { VenueMenuParser } from "./types";

const parsers: Record<string, () => Promise<VenueMenuParser>> = {
  "allianz-field": async () => {
    const { parseAllianzFieldMenu } = await import("./allianz-field");
    return parseAllianzFieldMenu;
  },
  "target-field": async () => {
    const { parseTargetFieldMenu } = await import("./target-field");
    return parseTargetFieldMenu;
  }
};

export function getRegisteredVenueSlugs(): string[] {
  return Object.keys(parsers);
}

export async function getVenueMenuParser(
  venueSlug: string
): Promise<VenueMenuParser | null> {
  const loader = parsers[venueSlug];
  if (!loader) return null;
  return loader();
}
