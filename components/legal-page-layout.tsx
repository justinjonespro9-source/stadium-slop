import Link from "next/link";
import type { ReactNode } from "react";

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
    <main className="brand-page min-h-screen">
      <article className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-10">
        <Link
          href="/"
          className="inline-flex text-xs font-bold text-[var(--slop-cream-dim)] transition hover:text-[var(--slop-cream)] sm:text-sm"
        >
          ← Home
        </Link>

        <header className="mt-4 border-b border-[var(--slop-line-strong)] pb-5 sm:mt-5">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            {LEGAL_PRODUCT} · {LEGAL_OPERATOR}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--slop-cream)] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
            {description}
          </p>
          <p className="mt-2 text-xs text-[var(--slop-cream-dim)]">
            Last updated: {LEGAL_LAST_UPDATED}
          </p>
        </header>

        <div className="legal-prose mt-6 space-y-8 sm:mt-8 sm:space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="text-base font-black text-[var(--slop-cream)] sm:text-lg">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p
                  key={`${section.id}-p-${index}`}
                  className="mt-3 text-sm leading-relaxed text-[var(--slop-cream-muted)]"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
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
          className="mt-10 flex flex-wrap gap-3 border-t border-[var(--slop-line-strong)] pt-6 text-xs font-bold"
          aria-label="Related legal pages"
        >
          <Link
            href="/terms"
            className="text-[var(--slop-cream-dim)] hover:text-[var(--slop-gold-bright)]"
          >
            Terms of Use
          </Link>
          <Link
            href="/privacy"
            className="text-[var(--slop-cream-dim)] hover:text-[var(--slop-gold-bright)]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/disclaimer"
            className="text-[var(--slop-cream-dim)] hover:text-[var(--slop-gold-bright)]"
          >
            Disclaimer
          </Link>
        </nav>
      </article>
    </main>
  );
}
