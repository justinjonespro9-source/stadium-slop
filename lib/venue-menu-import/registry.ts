import type { VenueMenuParser } from "./types";

const parsers: Record<string, () => Promise<VenueMenuParser>> = {
  "allianz-field": async () => {
    const { parseAllianzFieldMenu } = await import("./allianz-field");
    return parseAllianzFieldMenu;
  },
  "target-field": async () => {
    const { parseTargetFieldMenu } = await import("./target-field");
    return parseTargetFieldMenu;
  },
  "oriole-park-at-camden-yards": async () => {
    const { parseOrioleParkMenu } = await import("./oriole-park-at-camden-yards");
    return parseOrioleParkMenu;
  },
  "fenway-park": async () => {
    const { parseFenwayParkMenu } = await import("./fenway-park");
    return parseFenwayParkMenu;
  },
  "yankee-stadium": async () => {
    const { parseYankeeStadiumMenu } = await import("./yankee-stadium");
    return parseYankeeStadiumMenu;
  },
  "tropicana-field": async () => {
    const { parseTropicanaFieldMenu } = await import("./tropicana-field");
    return parseTropicanaFieldMenu;
  },
  "rogers-centre": async () => {
    const { parseRogersCentreMenu } = await import("./rogers-centre");
    return parseRogersCentreMenu;
  },
  "truist-park": async () => {
    const { parseTruistParkMenu } = await import("./truist-park");
    return parseTruistParkMenu;
  },
  "loandepot-park": async () => {
    const { parseLoanDepotParkMenu } = await import("./loandepot-park");
    return parseLoanDepotParkMenu;
  },
  "citi-field": async () => {
    const { parseCitiFieldMenu } = await import("./citi-field");
    return parseCitiFieldMenu;
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
