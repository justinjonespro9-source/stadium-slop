export const FAIR_IMPORT_SOURCES = ["preview", "core-catalog"] as const;

export type FairImportSource = (typeof FAIR_IMPORT_SOURCES)[number];

export function parseFairImportSourceArg(argv: string[]): FairImportSource {
  const raw = argv.find((a) => a.startsWith("--source="))?.split("=")[1]?.trim();
  if (!raw || raw === "preview") {
    return "preview";
  }
  if (raw === "core-catalog") {
    return "core-catalog";
  }
  throw new Error(`Unknown --source=${raw}. Use preview or core-catalog.`);
}

export function fairImportTagsForSource(
  source: FairImportSource,
  venueSlug: string
): string[] {
  const base = ["state-fair", venueSlug];
  if (source === "core-catalog") {
    return [...base, "core-catalog", "official-source", "prior-year-listing"];
  }
  return [...base, "2025-preview", "prior-year-listing"];
}
