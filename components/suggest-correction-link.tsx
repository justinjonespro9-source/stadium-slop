import Link from "next/link";

import {
  buildSuggestCorrectionHref,
  type SuggestCorrectionContext
} from "@/lib/suggest-correction";

type SuggestCorrectionLinkProps = {
  context: SuggestCorrectionContext;
  className?: string;
};

/** Inline fan correction link — prefills /suggest-correction from page context. */
export function SuggestCorrectionLink({
  context,
  className = ""
}: SuggestCorrectionLinkProps) {
  const href = buildSuggestCorrectionHref(context);

  return (
    <p
      className={`text-[0.65rem] leading-snug text-[var(--slop-cream-dim)] sm:text-xs ${className}`}
    >
      Something look off?{" "}
      <Link
        href={href}
        className="font-bold text-[var(--slop-cream-muted)] underline-offset-2 hover:text-[var(--slop-gold-bright)] hover:underline"
      >
        Suggest correction
      </Link>
    </p>
  );
}
