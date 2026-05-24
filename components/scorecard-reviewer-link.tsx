import Link from "next/link";
import type { ReactNode } from "react";

type ScorecardReviewerLinkProps = {
  href?: string;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
};

/** Reviewer identity on scorecards — link when venue history is allowed. */
export function ScorecardReviewerLink({
  href,
  ariaLabel,
  className = "",
  children
}: ScorecardReviewerLinkProps) {
  if (!href) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`rounded-md transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--slop-gold-bright)] ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
