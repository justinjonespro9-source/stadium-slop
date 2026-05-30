import type { FairMenuParseResult } from "./types";

export type FairMenuParser = () => Promise<FairMenuParseResult>;

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

export async function getFairMenuParser(slug: string): Promise<FairMenuParser | null> {
  const loader = parsers[slug];
  if (!loader) return null;
  return loader();
}
