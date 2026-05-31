import Link from "next/link";

import {
  formatPreviewItemCount,
  STATE_FAIR_DIRECTORY_DISCLAIMER,
  STATE_FAIR_DIRECTORY_ENTRIES,
  type StateFairDirectoryStatus
} from "@/lib/state-fair-directory";

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
      className="state-fair-directory mt-8 sm:mt-10"
      aria-labelledby="state-fair-directory-heading"
    >
      <p className="media-section-eyebrow">Directory</p>
      <h2 id="state-fair-directory-heading" className="media-section-title">
        State Fair Food Guides
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--media-ink-muted)] sm:text-[0.9375rem]">
        Browse early fair food guides for major fairs. Listings are based on public preview
        information and may change as official food finders update.
      </p>

      <ul className="state-fair-directory-grid mt-5">
        {STATE_FAIR_DIRECTORY_ENTRIES.map((fair) => (
          <li key={fair.slug} className="state-fair-directory-card">
            <div className="state-fair-directory-card__header">
              <div className="min-w-0">
                <h3 className="state-fair-directory-card__title">{fair.name}</h3>
                <p className="state-fair-directory-card__location">{fair.location}</p>
              </div>
              <span className={statusBadgeClass(fair.status)}>{fair.statusLabel}</span>
            </div>

            {fair.previewItemCount != null && fair.previewItemCount > 0 ? (
              <p className="state-fair-directory-card__meta">
                {formatPreviewItemCount(fair.previewItemCount)} (preview sources)
              </p>
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
        ))}
      </ul>

      <p className="state-fair-directory__disclaimer">{STATE_FAIR_DIRECTORY_DISCLAIMER}</p>
    </section>
  );
}
