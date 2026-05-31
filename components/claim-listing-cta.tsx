import Link from "next/link";

import {
  buildClaimHref,
  claimCtaCompactLine,
  claimCtaHeadline,
  claimCtaSubline,
  type ClaimListingContext
} from "@/lib/claim-listing";

type ClaimListingCtaProps = {
  context: ClaimListingContext;
  /** Applied to the compact mobile row only. */
  className?: string;
  /** Applied to the expanded desktop card (venue / item pages). */
  desktopClassName?: string;
};

/** Subtle business lane — links to /claim with listing context in the query string. */
export function ClaimListingCta({
  context,
  className = "",
  desktopClassName = ""
}: ClaimListingCtaProps) {
  const href = buildClaimHref(context);
  const venueSlug = context.venueSlug;
  const compactLine = claimCtaCompactLine(context.kind, venueSlug);

  return (
    <aside className="claim-listing-cta min-w-0" aria-label="Claim or update this listing">
      <Link href={href} className={`claim-listing-cta__mobile md:hidden ${className}`}>
        <span className="claim-listing-cta__mobile-text">{compactLine}</span>
      </Link>

      <div
        className={`claim-listing-cta__desktop hidden md:block ${desktopClassName}`.trim()}
      >
        <p className="claim-listing-cta__eyebrow">Operator &amp; vendor lane</p>
        <p className="claim-listing-cta__headline">{claimCtaHeadline(context.kind, venueSlug)}</p>
        <p className="claim-listing-cta__subline">{claimCtaSubline(context.kind, venueSlug)}</p>
        <Link href={href} className="claim-listing-cta__link">
          Claim this listing
          <span aria-hidden>→</span>
        </Link>
      </div>
    </aside>
  );
}
