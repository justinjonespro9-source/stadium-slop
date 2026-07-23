export const FAIR_IMPORT_SOURCES = ["preview", "core-catalog", "mspmag-2025"] as const;

export type FairImportSource = (typeof FAIR_IMPORT_SOURCES)[number];

export function parseFairImportSourceArg(argv: string[]): FairImportSource {
  const raw = argv.find((a) => a.startsWith("--source="))?.split("=")[1]?.trim();
  if (!raw || raw === "preview") {
    return "preview";
  }
  if (raw === "core-catalog") {
    return "core-catalog";
  }
  if (raw === "mspmag-2025") {
    return "mspmag-2025";
  }
  throw new Error(
    `Unknown --source=${raw}. Use preview, core-catalog, or mspmag-2025.`
  );
}

export function fairImportTagsForSource(
  source: FairImportSource,
  venueSlug: string,
  sourceYear: number = 2025
): string[] {
  const base = ["state-fair", venueSlug];
  if (source === "core-catalog") {
    return [...base, "core-catalog", "official-source"];
  }
  if (source === "mspmag-2025") {
    return [...base, "mspmag-2025", "third-party-source", "prior-year-listing"];
  }
  if (sourceYear >= 2026) {
    return [...base, `${sourceYear}-preview`, "new-food"];
  }
  return [...base, "2025-preview", "prior-year-listing"];
}
