/**
 * Estadio Akron (Guadalajara) — FIFA World Cup 2026 host venue.
 * Starter menu only; expand with fan reviews and future official sources.
 */

import { parseMexicoWorldCupStarterMenu } from "./mexico-world-cup-starter-menu";
import type { VenueMenuParseResult } from "./types";

const VENUE = {
  venueSlug: "estadio-akron",
  venueName: "Estadio Akron"
} as const;

export function parseEstadioAkronMenu(
  sourceUrl?: string
): Promise<VenueMenuParseResult> {
  return parseMexicoWorldCupStarterMenu(VENUE, sourceUrl);
}
