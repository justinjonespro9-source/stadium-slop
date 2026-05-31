import type { FairImportSource } from "./sources";
import type { FairMenuParseResult } from "./types";

export type FairMenuParser = (source?: FairImportSource) => Promise<FairMenuParseResult>;

const parsers: Record<string, () => Promise<FairMenuParser>> = {
  "minnesota-state-fair": async () => {
    const { parseMinnesotaStateFairMenu } = await import("./parsers/minnesota-state-fair");
    return parseMinnesotaStateFairMenu;
  },
  "iowa-state-fair": async () => {
    const { parseIowaStateFairMenu } = await import("./parsers/iowa-state-fair");
    return parseIowaStateFairMenu;
  },
  "state-fair-of-texas": async () => {
    const { parseStateFairOfTexasMenu } = await import("./parsers/state-fair-of-texas");
    return parseStateFairOfTexasMenu;
  },
  "wisconsin-state-fair": async () => {
    const { parseWisconsinStateFairMenu } = await import("./parsers/wisconsin-state-fair");
    return parseWisconsinStateFairMenu;
  },
  "the-big-e": async () => {
    const { parseTheBigEMenu } = await import("./parsers/the-big-e");
    return parseTheBigEMenu;
  }
};

export function getRegisteredFairSlugs(): string[] {
  return Object.keys(parsers);
}

const CORE_CATALOG_FAIRS = new Set([
  "minnesota-state-fair",
  "iowa-state-fair",
  "wisconsin-state-fair",
  "state-fair-of-texas",
  "the-big-e"
]);

export function fairSupportsImportSource(slug: string, source: FairImportSource): boolean {
  if (source === "mspmag-2025") {
    return slug === "minnesota-state-fair";
  }
  if (source === "core-catalog") {
    return CORE_CATALOG_FAIRS.has(slug);
  }
  return source === "preview";
}

export async function getFairMenuParser(slug: string): Promise<FairMenuParser | null> {
  const loader = parsers[slug];
  if (!loader) return null;
  return loader();
}
