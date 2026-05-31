import Link from "next/link";

import {
  formatPreviewItemCount,
  formatTrackedFoodCount,
  STATE_FAIR_DIRECTORY_ENTRIES,
  type StateFairDirectoryStatus
} from "@/lib/state-fair-directory";

function fairFoodMetaLine(
  fair: (typeof STATE_FAIR_DIRECTORY_ENTRIES)[number]
): string | null {
  if (fair.trackedFoodCount != null && fair.trackedFoodCount > 0) {
    return formatTrackedFoodCount(fair.trackedFoodCount);
  }
  if (fair.previewItemCount != null && fair.previewItemCount > 0) {
    return `${formatPreviewItemCount(fair.previewItemCount)} (preview sources)`;
  }
  return null;
}

function statusBadgeClass(status: StateFairDirectoryStatus): string {
  if (status === "preview-loaded") {
    return "state-fair-directory-card__status state-fair-directory-card__status--loaded";
  }
  if (status === "import-ready") {
    return "state-fair-directory-card__status state-fair-directory-card__status--ready";
  }
  return "state-fair-directory-card__status state-fair-directory-card__status--shell";
}

export function StateFairDirectorySection() {
  return (
    <section
      className="state-fair-directory mt-4 sm:mt-6"
      aria-labelledby="state-fair-directory-heading"
    >
      <p className="media-section-eyebrow">Directory</p>
      <h2 id="state-fair-directory-heading" className="media-section-title">
        State Fair Food Guides
      </h2>
      <ul className="state-fair-directory-grid mt-4 sm:mt-5">
        {STATE_FAIR_DIRECTORY_ENTRIES.map((fair) => {
          const foodMeta = fairFoodMetaLine(fair);
          return (
          <li key={fair.slug} className="state-fair-directory-card">
            <div className="state-fair-directory-card__header">
              <div className="min-w-0">
                <h3 className="state-fair-directory-card__title">{fair.name}</h3>
                <p className="state-fair-directory-card__location">{fair.location}</p>
                <p className="state-fair-directory-card__dates">{fair.fairDates2026}</p>
              </div>
              <span className={statusBadgeClass(fair.status)}>{fair.statusLabel}</span>
            </div>

            {foodMeta ? (
              <p className="state-fair-directory-card__meta">{foodMeta}</p>
            ) : (
              <p className="state-fair-directory-card__meta state-fair-directory-card__meta--dim">
                Foods listing in progress
              </p>
            )}

            <Link href={fair.venuePath} className="state-fair-directory-card__cta">
              View guide
              <span className="state-fair-directory-card__cta-arrow" aria-hidden>
                →
              </span>
            </Link>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
