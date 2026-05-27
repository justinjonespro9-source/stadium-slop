/**
 * Estadio Azteca (Mexico City) — FIFA World Cup 2026 host venue.
 * Starter menu only; expand with fan reviews and future official sources.
 */

import { parseMexicoWorldCupStarterMenu } from "./mexico-world-cup-starter-menu";
import type { VenueMenuParseResult } from "./types";

const VENUE = {
  venueSlug: "estadio-azteca",
  venueName: "Estadio Azteca"
} as const;

export function parseEstadioAztecaMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  return parseMexicoWorldCupStarterMenu(VENUE, sourceUrl);
}
