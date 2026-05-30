import {
  FAIR_VENUE_SLUGS,
  getFairVenueDefinition,
  type FairVenueSlug
} from "@/lib/fair-import/venues";

export const STATE_FAIR_DIRECTORY_DISCLAIMER =
  "Unofficial fan-powered guide. Food and vendor listings may change.";

export type StateFairDirectoryStatus =
  | "preview-loaded"
  | "import-ready"
  | "venue-shell";

export type StateFairDirectoryEntry = {
  slug: FairVenueSlug;
  name: string;
  location: string;
  statusLabel: string;
  status: StateFairDirectoryStatus;
  /** Static preview menu count from import sources — not live DB totals. */
  previewItemCount: number | null;
  venuePath: `/venues/${FairVenueSlug}`;
};

/** Static directory metadata — update when fair imports are applied or expanded. */
const DIRECTORY_META: Record<
  FairVenueSlug,
  Pick<StateFairDirectoryEntry, "statusLabel" | "status" | "previewItemCount">
> = {
  "minnesota-state-fair": {
    statusLabel: "Preview foods loaded",
    status: "preview-loaded",
    previewItemCount: 22
  },
  "iowa-state-fair": {
    statusLabel: "Preview import ready",
    status: "import-ready",
    previewItemCount: 22
  },
  "state-fair-of-texas": {
    statusLabel: "Preview import ready",
    status: "import-ready",
    previewItemCount: 15
  },
  "wisconsin-state-fair": {
    statusLabel: "Preview import ready",
    status: "import-ready",
    previewItemCount: 12
  },
  "the-big-e": {
    statusLabel: "Venue shell ready",
    status: "venue-shell",
    previewItemCount: null
  }
};

export const STATE_FAIR_DIRECTORY_ENTRIES: StateFairDirectoryEntry[] = FAIR_VENUE_SLUGS.map(
  (slug) => {
    const venue = getFairVenueDefinition(slug);
    if (!venue) {
      throw new Error(`Missing fair venue definition for ${slug}`);
    }
    const meta = DIRECTORY_META[slug];
    return {
      slug,
      name: venue.name,
      location: `${venue.city}, ${venue.state}`,
      statusLabel: meta.statusLabel,
      status: meta.status,
      previewItemCount: meta.previewItemCount,
      venuePath: `/venues/${slug}`
    };
  }
);

export function formatPreviewItemCount(count: number): string {
  return count === 1 ? "1 preview food" : `${count} preview foods`;
}
