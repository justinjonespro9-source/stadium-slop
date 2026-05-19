import Link from "next/link";

import {
  buildReportContentHref,
  type ReportContentContext
} from "@/lib/report-content";

type ReportContentLinkProps = {
  context: ReportContentContext;
  className?: string;
  /** `card` — minimal link on Slop Cards; `section` — one line under Photo reviews */
  variant?: "card" | "section";
};

/** Subtle fan report link — prefills /report-content from page context. */
export function ReportContentLink({
  context,
  className = "",
  variant = "card"
}: ReportContentLinkProps) {
  const href = buildReportContentHref(context);

  if (variant === "section") {
    return (
      <p
        className={`text-[0.65rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs ${className}`}
      >
        See something off in a fan review or photo?{" "}
        <Link
          href={href}
          className="font-bold text-[var(--slop-cream-muted)] underline-offset-2 hover:text-[var(--slop-gold-bright)] hover:underline"
        >
          Report content
        </Link>
      </p>
    );
  }

  return (
    <p
      className={`text-center text-[0.58rem] leading-snug text-[var(--slop-cream-dim)] ${className}`}
    >
      <Link
        href={href}
        className="font-semibold text-[var(--slop-cream-dim)] underline-offset-2 hover:text-[var(--slop-cream-muted)] hover:underline"
      >
        Report review or photo
      </Link>
    </p>
  );
}
