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
  },
  "paypal-park": async () => {
    const { parsePayPalParkMenu } = await import("./paypal-park");
    return parsePayPalParkMenu;
  },
  "bank-of-america-stadium": async () => {
    const { parseBankOfAmericaStadiumMenu } = await import(
      "./bank-of-america-stadium"
    );
    return parseBankOfAmericaStadiumMenu;
  },
  "dick-s-sporting-goods-park": async () => {
    const { parseDickSSportingGoodsParkMenu } = await import(
      "./dick-s-sporting-goods-park"
    );
    return parseDickSSportingGoodsParkMenu;
  },
  "toyota-stadium-frisco": async () => {
    const { parseToyotaStadiumFriscoMenu } = await import(
      "./toyota-stadium-frisco"
    );
    return parseToyotaStadiumFriscoMenu;
  },
  "dignity-health-sports-park": async () => {
    const { parseDignityHealthSportsParkMenu } = await import(
      "./dignity-health-sports-park"
    );
    return parseDignityHealthSportsParkMenu;
  },
  "gillette-stadium": async () => {
    const { parseGilletteStadiumMenu } = await import("./gillette-stadium");
    return parseGilletteStadiumMenu;
  },
  "interco-stadium": async () => {
    const { parseIntercoStadiumMenu } = await import("./interco-stadium");
    return parseIntercoStadiumMenu;
  },
  "america-first-field": async () => {
    const { parseAmericaFirstFieldMenu } = await import("./america-first-field");
    return parseAmericaFirstFieldMenu;
  },
  "lumen-field": async () => {
    const { parseLumenFieldMenu } = await import("./lumen-field");
    return parseLumenFieldMenu;
  },
  "bc-place": async () => {
    const { parseBcPlaceMenu } = await import("./bc-place");
    return parseBcPlaceMenu;
  },
  "att-stadium": async () => {
    const { parseAttStadiumMenu } = await import("./att-stadium");
    return parseAttStadiumMenu;
  },
  "arrowhead-stadium": async () => {
    const { parseArrowheadStadiumMenu } = await import("./arrowhead-stadium");
    return parseArrowheadStadiumMenu;
  },
  "sofi-stadium": async () => {
    const { parseSofiStadiumMenu } = await import("./sofi-stadium");
    return parseSofiStadiumMenu;
  },
  "metlife-stadium": async () => {
    const { parseMetLifeStadiumMenu } = await import("./metlife-stadium");
    return parseMetLifeStadiumMenu;
  },
  "lincoln-financial-field": async () => {
    const { parseLincolnFinancialFieldMenu } = await import(
      "./lincoln-financial-field"
    );
    return parseLincolnFinancialFieldMenu;
  },
  "nrg-stadium": async () => {
    const { parseNrgStadiumMenu } = await import("./nrg-stadium");
    return parseNrgStadiumMenu;
  },
  "levis-stadium": async () => {
    const { parseLevisStadiumMenu } = await import("./levis-stadium");
    return parseLevisStadiumMenu;
  },
  "hard-rock-stadium": async () => {
    const { parseHardRockStadiumMenu } = await import("./hard-rock-stadium");
    return parseHardRockStadiumMenu;
  },
  "estadio-azteca": async () => {
    const { parseEstadioAztecaMenu } = await import("./estadio-azteca");
    return parseEstadioAztecaMenu;
  },
  "estadio-bbva": async () => {
    const { parseEstadioBbvaMenu } = await import("./estadio-bbva");
    return parseEstadioBbvaMenu;
  },
  "estadio-akron": async () => {
    const { parseEstadioAkronMenu } = await import("./estadio-akron");
    return parseEstadioAkronMenu;
  },
  "frost-bank-center": async () => {
    const { parseFrostBankCenterMenu } = await import("./frost-bank-center");
    return parseFrostBankCenterMenu;
  },
  "madison-square-garden": async () => {
    const { parseMadisonSquareGardenMenu } = await import("./madison-square-garden");
    return parseMadisonSquareGardenMenu;
  },
  "lenovo-center": async () => {
    const { parseLenovoCenterMenu } = await import("./lenovo-center");
    return parseLenovoCenterMenu;
  },
  "t-mobile-arena": async () => {
    const { parseTMobileArenaMenu } = await import("./t-mobile-arena");
    return parseTMobileArenaMenu;
  },
  "michigan-stadium": async () => {
    const { parseMichiganStadiumMenu } = await import("./michigan-stadium");
    return parseMichiganStadiumMenu;
  },
  "ohio-stadium": async () => {
    const { parseOhioStadiumMenu } = await import("./ohio-stadium");
    return parseOhioStadiumMenu;
  },
  "bryant-denny-stadium": async () => {
    const { parseBryantDennyStadiumMenu } = await import("./bryant-denny-stadium");
    return parseBryantDennyStadiumMenu;
  },
  "neyland-stadium": async () => {
    const { parseNeylandStadiumMenu } = await import("./neyland-stadium");
    return parseNeylandStadiumMenu;
  },
  "notre-dame-stadium": async () => {
    const { parseNotreDameStadiumMenu } = await import("./notre-dame-stadium");
    return parseNotreDameStadiumMenu;
  },
  "tiger-stadium": async () => {
    const { parseTigerStadiumMenu } = await import("./tiger-stadium");
    return parseTigerStadiumMenu;
  },
  "kyle-field": async () => {
    const { parseKyleFieldMenu } = await import("./kyle-field");
    return parseKyleFieldMenu;
  },
  "sanford-stadium": async () => {
    const { parseSanfordStadiumMenu } = await import("./sanford-stadium");
    return parseSanfordStadiumMenu;
  },
  "darrell-k-royal-texas-memorial-stadium": async () => {
    const { parseDarrellKRoyalTexasMemorialStadiumMenu } = await import(
      "./darrell-k-royal-texas-memorial-stadium"
    );
    return parseDarrellKRoyalTexasMemorialStadiumMenu;
  },
  "beaver-stadium": async () => {
    const { parseBeaverStadiumMenu } = await import("./beaver-stadium");
    return parseBeaverStadiumMenu;
  },
  "intuit-dome": async () => {
    const { parseIntuitDomeMenu } = await import("./intuit-dome");
    return parseIntuitDomeMenu;
  },
  "canada-life-centre": async () => {
    const { parseCanadaLifeCentreMenu } = await import("./canada-life-centre");
    return parseCanadaLifeCentreMenu;
  },
  "canadian-tire-centre": async () => {
    const { parseCanadianTireCentreMenu } = await import("./canadian-tire-centre");
    return parseCanadianTireCentreMenu;
  },
  "honda-center": async () => {
    const { parseHondaCenterMenu } = await import("./honda-center");
    return parseHondaCenterMenu;
  },
  "rogers-place": async () => {
    const { parseRogersPlaceMenu } = await import("./rogers-place");
    return parseRogersPlaceMenu;
  },
  "scotiabank-arena": async () => {
    const { parseScotiabankArenaMenu } = await import("./scotiabank-arena");
    return parseScotiabankArenaMenu;
  },
  "the-big-e": async () => {
    const { parseTheBigEMenu } = await import("./the-big-e");
    return parseTheBigEMenu;
  },
  "scotiabank-saddledome": async () => {
    const { parseScotiabankSaddledomeMenu } = await import("./scotiabank-saddledome");
    return parseScotiabankSaddledomeMenu;
  },
  "footprint-center": async () => {
    const { parseFootprintCenterMenu } = await import("./footprint-center");
    return parseFootprintCenterMenu;
  },
  "ball-arena": async () => {
    const { parseBallArenaMenu } = await import("./ball-arena");
    return parseBallArenaMenu;
  },
  "capital-one-arena": async () => {
    const { parseCapitalOneArenaMenu } = await import("./capital-one-arena");
    return parseCapitalOneArenaMenu;
  },
  "american-airlines-center": async () => {
    const { parseAmericanAirlinesCenterMenu } = await import(
      "./american-airlines-center"
    );
    return parseAmericanAirlinesCenterMenu;
  },
  "delta-center": async () => {
    const { parseDeltaCenterMenu } = await import("./delta-center");
    return parseDeltaCenterMenu;
  },
  "ubs-arena": async () => {
    const { parseUbsArenaMenu } = await import("./ubs-arena");
    return parseUbsArenaMenu;
  },
  "prudential-center": async () => {
    const { parsePrudentialCenterMenu } = await import("./prudential-center");
    return parsePrudentialCenterMenu;
  },
  "keybank-center": async () => {
    const { parseKeybankCenterMenu } = await import("./keybank-center");
    return parseKeybankCenterMenu;
  },
  "ppg-paints-arena": async () => {
    const { parsePpgPaintsArenaMenu } = await import("./ppg-paints-arena");
    return parsePpgPaintsArenaMenu;
  },
  "cpkc-stadium": async () => {
    const { parseCpkcStadiumMenu } = await import("./cpkc-stadium");
    return parseCpkcStadiumMenu;
  },
  "rogers-arena": async () => {
    const { parseRogersArenaMenu } = await import("./rogers-arena");
    return parseRogersArenaMenu;
  },
  "bell-centre": async () => {
    const { parseBellCentreMenu } = await import("./bell-centre");
    return parseBellCentreMenu;
  },
  "enterprise-center": async () => {
    const { parseEnterpriseCenterMenu } = await import("./enterprise-center");
    return parseEnterpriseCenterMenu;
  },
  "nationwide-arena": async () => {
    const { parseNationwideArenaMenu } = await import("./nationwide-arena");
    return parseNationwideArenaMenu;
  },
  "rocket-arena": async () => {
    const { parseRocketArenaMenu } = await import("./rocket-arena");
    return parseRocketArenaMenu;
  },
  "gainbridge-fieldhouse": async () => {
    const { parseGainbridgeFieldhouseMenu } = await import(
      "./gainbridge-fieldhouse"
    );
    return parseGainbridgeFieldhouseMenu;
  },
  "lynn-family-stadium": async () => {
    const { parseLynnFamilyStadiumMenu } = await import("./lynn-family-stadium");
    return parseLynnFamilyStadiumMenu;
  },
  "wakemed-soccer-park": async () => {
    const { parseWakemedSoccerParkMenu } = await import("./wakemed-soccer-park");
    return parseWakemedSoccerParkMenu;
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
