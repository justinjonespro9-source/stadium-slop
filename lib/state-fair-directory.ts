import {
  FAIR_VENUE_SLUGS,
  getFairVenueDefinition,
  type FairVenueSlug
} from "@/lib/fair-import/venues";
import { FAIR_PREVIEW_NOTICE } from "@/lib/fair-preview";

export const STATE_FAIR_DIRECTORY_DISCLAIMER = FAIR_PREVIEW_NOTICE;

export type StateFairDirectoryStatus =
  | "preview-loaded"
  | "import-ready"
  | "venue-shell";

export type StateFairDirectoryEntry = {
  slug: FairVenueSlug;
  name: string;
  location: string;
  /** 2026 fair run dates (static). */
  fairDates2026: string;
  statusLabel: string;
  status: StateFairDirectoryStatus;
  /** Static preview-only count (e.g. official new-food list). */
  previewItemCount: number | null;
  /** Total foods on the venue guide when known (preview + core catalog, etc.). */
  trackedFoodCount: number | null;
  venuePath: `/venues/${FairVenueSlug}`;
};

/** Static directory metadata — update when fair imports are applied or expanded. */
const DIRECTORY_META: Record<
  FairVenueSlug,
  Pick<
    StateFairDirectoryEntry,
    | "fairDates2026"
    | "statusLabel"
    | "status"
    | "previewItemCount"
    | "trackedFoodCount"
  >
> = {
  "minnesota-state-fair": {
    fairDates2026: "Aug. 27 – Sept. 7, 2026",
    statusLabel: "62 foods tracked",
    status: "preview-loaded",
    previewItemCount: 22,
    trackedFoodCount: 62
  },
  "iowa-state-fair": {
    fairDates2026: "Aug. 13 – Aug. 23, 2026",
    statusLabel: "Foods listed",
    status: "preview-loaded",
    previewItemCount: 22,
    trackedFoodCount: 22
  },
  "state-fair-of-texas": {
    fairDates2026: "Sept. 25 – Oct. 18, 2026",
    statusLabel: "Preview list ready",
    status: "import-ready",
    previewItemCount: 15,
    trackedFoodCount: null
  },
  "wisconsin-state-fair": {
    fairDates2026: "Aug. 6 – Aug. 16, 2026",
    statusLabel: "Foods listed",
    status: "preview-loaded",
    previewItemCount: 12,
    trackedFoodCount: 12
  },
  "the-big-e": {
    fairDates2026: "Sept. 18 – Oct. 4, 2026",
    statusLabel: "Guide shell only",
    status: "venue-shell",
    previewItemCount: null,
    trackedFoodCount: null
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
      fairDates2026: meta.fairDates2026,
      statusLabel: meta.statusLabel,
      status: meta.status,
      previewItemCount: meta.previewItemCount,
      trackedFoodCount: meta.trackedFoodCount,
      venuePath: `/venues/${slug}`
    };
  }
);

export function formatPreviewItemCount(count: number): string {
  return count === 1 ? "1 food listed" : `${count} foods listed`;
}

export function formatTrackedFoodCount(count: number): string {
  if (count >= 100) {
    return `${count} foods tracked`;
  }
  return count === 1 ? "1 food tracked" : `${count} foods tracked`;
}
