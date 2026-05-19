import Link from "next/link";
import type { Metadata } from "next";

import { ClaimInquiryForm } from "@/components/claim-inquiry-form";
import {
  claimPageLead,
  claimPageTitle,
  getPartnerFeatureTeasers,
  parseClaimSearchParams
} from "@/lib/claim-listing";
import { PROMOTED_PLACEMENT_NOTE, PUBLIC_TRUST_STATEMENT } from "@/lib/site-contact";
import { getAbsoluteUrl } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Claim or partner",
  description:
    "Partnership, vendor, and listing inquiries for Stadium Slop — specific listings or general business questions.",
  alternates: { canonical: getAbsoluteUrl("/claim") }
};

type ClaimPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClaimPage({ searchParams }: ClaimPageProps) {
  const query = (await searchParams) ?? {};
  const context = parseClaimSearchParams(query);
  const teasers = getPartnerFeatureTeasers();

  return (
    <main className="brand-page min-h-screen">
      <section className="mx-auto w-full max-w-2xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:px-10">
        <Link
          href={context?.pagePath ?? "/venues"}
          className="inline-flex text-xs font-bold text-[var(--slop-cream-dim)] hover:text-[var(--slop-cream)] sm:text-sm"
        >
          ← Back
        </Link>

        <header className="mt-3 border-b border-[var(--slop-line-strong)] pb-4 sm:mt-4">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--slop-gold-dim)]">
            Operator &amp; vendor lane
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--slop-cream)] sm:text-3xl">
            {claimPageTitle(context)}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--slop-cream-muted)]">
            {claimPageLead(context)}
          </p>
        </header>

        <div className="mt-4 space-y-4">
          <ClaimInquiryForm context={context} />

          <aside className="rounded-xl border border-[var(--slop-line)] bg-[color:rgba(6,15,24,0.35)] px-3 py-3 sm:px-4">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--slop-gold-dim)]">
              Verified vendor support
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--slop-cream-dim)]">
              Coming soon: verified operator tools so you can refresh menus and
              stands without waiting on email. For now, we handle updates manually.
            </p>
            <p className="mt-3 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--slop-cream-dim)]">
              Official partner features (preview)
            </p>
            <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs text-[var(--slop-cream-muted)]">
              {teasers.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </aside>

          <p className="text-center text-sm leading-relaxed text-[var(--slop-cream-muted)]">
            {PUBLIC_TRUST_STATEMENT}
          </p>
          <p className="mt-1.5 text-center text-xs leading-snug text-[var(--slop-cream-dim)]">
            {PROMOTED_PLACEMENT_NOTE}
          </p>
        </div>
      </section>
    </main>
  );
}
