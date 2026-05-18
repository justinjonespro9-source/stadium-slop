import Link from "next/link";

import {
  buildClaimHref,
  claimCtaHeadline,
  claimCtaSubline,
  type ClaimListingContext
} from "@/lib/claim-listing";

type ClaimListingCtaProps = {
  context: ClaimListingContext;
  className?: string;
};

/** Subtle business lane — links to /claim with listing context in the query string. */
export function ClaimListingCta({ context, className = "" }: ClaimListingCtaProps) {
  const href = buildClaimHref(context);

  return (
    <aside
      className={`rounded-xl border border-[color:rgba(244,179,33,0.14)] bg-[color:rgba(6,15,24,0.45)] px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3 ${className}`}
      aria-label="Claim or update this listing"
    >
      <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--slop-gold-dim)]">
        Operator &amp; vendor lane
      </p>
      <p className="mt-1 text-sm font-bold leading-snug text-[var(--slop-cream)]">
        {claimCtaHeadline(context.kind)}
      </p>
      <p className="mt-1 text-[0.7rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs">
        {claimCtaSubline(context.kind)}
      </p>
      <Link
        href={href}
        className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-[color:rgba(244,179,33,0.35)] bg-[color:rgba(244,179,33,0.08)] px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--slop-gold-bright)] transition hover:border-[var(--slop-gold)] hover:bg-[color:rgba(244,179,33,0.14)] active:scale-[0.98] sm:text-xs"
      >
        Claim this listing
        <span aria-hidden>→</span>
      </Link>
    </aside>
  );
}
