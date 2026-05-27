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
  },
  "citizens-bank-park": async () => {
    const { parseCitizensBankParkMenu } = await import("./citizens-bank-park");
    return parseCitizensBankParkMenu;
  },
  "nationals-park": async () => {
    const { parseNationalsParkMenu } = await import("./nationals-park");
    return parseNationalsParkMenu;
  },
  "rate-field": async () => {
    const { parseRateFieldMenu } = await import("./rate-field");
    return parseRateFieldMenu;
  },
  "guaranteed-rate-field": async () => {
    const { parseRateFieldMenu } = await import("./rate-field");
    return parseRateFieldMenu;
  },
  "comerica-park": async () => {
    const { parseComericaParkMenu } = await import("./comerica-park");
    return parseComericaParkMenu;
  },
  "kauffman-stadium": async () => {
    const { parseKauffmanStadiumMenu } = await import("./kauffman-stadium");
    return parseKauffmanStadiumMenu;
  },
  "wrigley-field": async () => {
    const { parseWrigleyFieldMenu } = await import("./wrigley-field");
    return parseWrigleyFieldMenu;
  },
  "great-american-ball-park": async () => {
    const { parseGreatAmericanBallParkMenu } = await import("./great-american-ball-park");
    return parseGreatAmericanBallParkMenu;
  },
  "american-family-field": async () => {
    const { parseAmericanFamilyFieldMenu } = await import("./american-family-field");
    return parseAmericanFamilyFieldMenu;
  },
  "pnc-park": async () => {
    const { parsePncParkMenu } = await import("./pnc-park");
    return parsePncParkMenu;
  },
  "busch-stadium": async () => {
    const { parseBuschStadiumMenu } = await import("./busch-stadium");
    return parseBuschStadiumMenu;
  },
  "sutter-health-park": async () => {
    const { parseSutterHealthParkMenu } = await import("./sutter-health-park");
    return parseSutterHealthParkMenu;
  },
  "daikin-park": async () => {
    const { parseDaikinParkMenu } = await import("./daikin-park");
    return parseDaikinParkMenu;
  },
  "angel-stadium": async () => {
    const { parseAngelStadiumMenu } = await import("./angel-stadium");
    return parseAngelStadiumMenu;
  },
  "t-mobile-park": async () => {
    const { parseTMobileParkMenu } = await import("./t-mobile-park");
    return parseTMobileParkMenu;
  },
  "globe-life-field": async () => {
    const { parseGlobeLifeFieldMenu } = await import("./globe-life-field");
    return parseGlobeLifeFieldMenu;
  },
  "chase-field": async () => {
    const { parseChaseFieldMenu } = await import("./chase-field");
    return parseChaseFieldMenu;
  },
  "coors-field": async () => {
    const { parseCoorsFieldMenu } = await import("./coors-field");
    return parseCoorsFieldMenu;
  },
  "dodger-stadium": async () => {
    const { parseDodgerStadiumMenu } = await import("./dodger-stadium");
    return parseDodgerStadiumMenu;
  },
  "petco-park": async () => {
    const { parsePetcoParkMenu } = await import("./petco-park");
    return parsePetcoParkMenu;
  },
  "oracle-park": async () => {
    const { parseOracleParkMenu } = await import("./oracle-park");
    return parseOracleParkMenu;
  },
  "mercedes-benz-stadium": async () => {
    const { parseMercedesBenzStadiumMenu } = await import("./mercedes-benz-stadium");
    return parseMercedesBenzStadiumMenu;
  },
  "lower-com-field": async () => {
    const { parseLowerComFieldMenu } = await import("./lower-com-field");
    return parseLowerComFieldMenu;
  },
  "shell-energy-stadium": async () => {
    const { parseShellEnergyStadiumMenu } = await import("./shell-energy-stadium");
    return parseShellEnergyStadiumMenu;
  },
  "bmo-field": async () => {
    const { parseBmoFieldMenu } = await import("./bmo-field");
    return parseBmoFieldMenu;
  },
  "bmo-stadium": async () => {
    const { parseBmoStadiumMenu } = await import("./bmo-stadium");
    return parseBmoStadiumMenu;
  },
  "stade-saputo": async () => {
    const { parseStadeSaputoMenu } = await import("./stade-saputo");
    return parseStadeSaputoMenu;
  },
  "sports-illustrated-stadium": async () => {
    const { parseSportsIllustratedStadiumMenu } = await import("./sports-illustrated-stadium");
    return parseSportsIllustratedStadiumMenu;
  },
  "subaru-park": async () => {
    const { parseSubaruParkMenu } = await import("./subaru-park");
    return parseSubaruParkMenu;
  },
  "snapdragon-stadium": async () => {
    const { parseSnapdragonStadiumMenu } = await import("./snapdragon-stadium");
    return parseSnapdragonStadiumMenu;
  },
  "energizer-park": async () => {
    const { parseEnergizerParkMenu } = await import("./energizer-park");
    return parseEnergizerParkMenu;
  },
  "q2-stadium": async () => {
    const { parseQ2StadiumMenu } = await import("./q2-stadium");
    return parseQ2StadiumMenu;
  },
  "tql-stadium": async () => {
    const { parseTqlStadiumMenu } = await import("./tql-stadium");
    return parseTqlStadiumMenu;
  },
  "audi-field": async () => {
    const { parseAudiFieldMenu } = await import("./audi-field");
    return parseAudiFieldMenu;
  },
  "sporting-park": async () => {
    const { parseSportingParkMenu } = await import("./sporting-park");
    return parseSportingParkMenu;
  },
  "nu-stadium": async () => {
    const { parseNuStadiumMenu } = await import("./nu-stadium");
    return parseNuStadiumMenu;
  },
  "geodis-park": async () => {
    const { parseGeodisParkMenu } = await import("./geodis-park");
    return parseGeodisParkMenu;
  },
  "providence-park": async () => {
    const { parseProvidenceParkMenu } = await import("./providence-park");
    return parseProvidenceParkMenu;
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
