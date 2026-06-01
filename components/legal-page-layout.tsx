import Link from "next/link";
import type { ReactNode } from "react";

import { UtilityPageShell } from "@/components/utility/utility-page-shell";
import type { LegalSection } from "@/lib/legal-content";
import { LEGAL_LAST_UPDATED, LEGAL_OPERATOR, LEGAL_PRODUCT } from "@/lib/legal-content";

type LegalPageLayoutProps = {
  title: string;
  description: string;
  sections: LegalSection[];
  children?: ReactNode;
};

export function LegalPageLayout({
  title,
  description,
  sections,
  children
}: LegalPageLayoutProps) {
  return (
    <UtilityPageShell
      eyebrow={`${LEGAL_PRODUCT} · ${LEGAL_OPERATOR}`}
      title={title}
      description={
        <>
          <p>{description}</p>
          <p className="mt-2 text-[0.7rem] text-white/55">Last updated: {LEGAL_LAST_UPDATED}</p>
        </>
      }
      contentWidth="legal"
    >
      <article className="utility-legal-card media-panel-card px-4 py-5 sm:px-6 sm:py-7">
        <div className="utility-legal-prose space-y-8 sm:space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-base font-black text-[var(--media-ink)] sm:text-lg">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p
                  key={`${section.id}-p-${index}`}
                  className="mt-3 text-sm leading-relaxed text-[var(--media-ink-muted)]"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--media-ink-muted)]">
                  {section.bullets.map((item, index) => (
                    <li key={`${section.id}-b-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          {children}
        </div>

        <nav
          className="utility-legal-nav mt-10 flex flex-wrap gap-3 border-t border-[var(--media-border)] pt-6 text-xs font-bold"
          aria-label="Related legal pages"
        >
          <Link
            href="/about"
            className="text-[var(--media-ink-dim)] hover:text-[var(--media-orange-deep)]"
          >
            About
          </Link>
          <Link
            href="/terms"
            className="text-[var(--media-ink-dim)] hover:text-[var(--media-orange-deep)]"
          >
            Terms of Use
          </Link>
          <Link
            href="/privacy"
            className="text-[var(--media-ink-dim)] hover:text-[var(--media-orange-deep)]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/disclaimer"
            className="text-[var(--media-ink-dim)] hover:text-[var(--media-orange-deep)]"
          >
            Disclaimer
          </Link>
        </nav>
      </article>
    </UtilityPageShell>
  );
}
