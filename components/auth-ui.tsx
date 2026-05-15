import type { ReactNode } from "react";

import { BrandLockup } from "@/components/brand-lockup";

/** Matches `HomeVenueSearch` input styling — navy surface, gold focus ring. */
export const authFieldClass =
  "w-full rounded-xl border border-[var(--slop-line-strong)] bg-[var(--slop-navy-deep)] px-3.5 py-2.5 text-sm font-semibold text-[var(--slop-cream)] outline-none ring-[var(--slop-gold)] placeholder:text-[var(--slop-cream-dim)] focus-visible:ring-2";

export const authLabelClass =
  "text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[var(--slop-cream-dim)]";

type AuthPageScaffoldProps = {
  /** Short line above title (e.g. demo badge). */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Larger wordmark when true (login/signup). */
  compactLockup?: boolean;
};

/** Compact stadium auth shell: glow, centered card, mobile-first (top-weighted layout). */
export function AuthPageScaffold({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  compactLockup = false
}: AuthPageScaffoldProps) {
  return (
    <main className="brand-page relative min-h-dvh overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[min(38vh,260px)] bg-[radial-gradient(ellipse_90%_100%_at_50%_-10%,rgba(244,179,33,0.18),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-t from-[var(--slop-navy-deep)] via-transparent to-transparent opacity-70"
        aria-hidden
      />

      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[min(100%,380px)] flex-col px-4 pb-8 pt-5 sm:max-w-md sm:px-5 sm:pb-12 sm:pt-8">
        <div className="brand-panel brand-card mt-2 rounded-2xl border px-4 py-5 shadow-2xl sm:rounded-[1.65rem] sm:px-5 sm:py-6">
          <BrandLockup compact={compactLockup} />

          {eyebrow ? (
            <p className="brand-pill mt-4 inline-flex rounded-full px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--slop-cream-muted)]">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="mt-3 text-[1.65rem] font-black leading-tight tracking-tight text-[var(--slop-cream)] sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-[0.8rem] leading-snug text-[var(--slop-cream-muted)] sm:text-sm">
              {subtitle}
            </p>
          ) : null}

          {children}

          {footer ? (
            <div className="mt-5 border-t border-[var(--slop-line)] pt-4">{footer}</div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
