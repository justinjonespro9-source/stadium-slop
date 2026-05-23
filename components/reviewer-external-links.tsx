import {
  buildReviewerExternalLinks,
  externalLinkDisplayLabel,
  type ReviewerExternalLink,
  type StoredProfileSocial
} from "@/lib/profile-social-links";

type ReviewerExternalLinksProps = {
  social: Pick<
    StoredProfileSocial,
    | "instagramUrl"
    | "tiktokUrl"
    | "youtubeUrl"
    | "xUrl"
    | "websiteUrl"
    | "socialLinksPublic"
  >;
  /** Pre-built links override social payload (for tests). */
  links?: ReviewerExternalLink[];
  heading?: string;
  className?: string;
  compact?: boolean;
};

export function ReviewerExternalLinks({
  social,
  links,
  heading = "Find me elsewhere",
  className = "",
  compact = false
}: ReviewerExternalLinksProps) {
  const resolved = links ?? buildReviewerExternalLinks(social);
  if (resolved.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <p
        className={
          compact
            ? "text-[0.52rem] font-bold uppercase tracking-[0.1em] text-[var(--slop-cream-dim)]"
            : "text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]"
        }
      >
        {heading}
      </p>
      <ul className={`mt-1.5 flex flex-wrap gap-1.5 ${compact ? "" : "gap-2"}`}>
        {resolved.map((link) => (
          <li key={link.id}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                compact
                  ? "inline-flex items-center rounded border border-[var(--slop-line)] bg-[rgba(6,14,24,0.45)] px-1.5 py-0.5 text-[0.52rem] font-bold text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)]/45 hover:text-[var(--slop-gold-bright)]"
                  : "inline-flex min-h-8 items-center rounded-lg border border-[var(--slop-line-strong)] bg-[color:rgba(6,15,24,0.55)] px-2.5 py-1 text-[0.65rem] font-bold text-[var(--slop-cream-muted)] transition hover:border-[var(--slop-gold)]/45 hover:text-[var(--slop-gold-bright)]"
              }
            >
              {externalLinkDisplayLabel(link)}
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </li>
        ))}
      </ul>
      <p
        className={
          compact
            ? "mt-1 text-[0.48rem] text-[var(--slop-cream-dim)]"
            : "mt-2 text-[0.6rem] leading-snug text-[var(--slop-cream-dim)]"
        }
      >
        External link — not hosted by Stadium Slop.
      </p>
    </div>
  );
}
