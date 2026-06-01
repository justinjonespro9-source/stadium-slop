import type { Metadata } from "next";

import { ClaimInquiryForm } from "@/components/claim-inquiry-form";
import { UtilityPageShell } from "@/components/utility/utility-page-shell";
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
    <UtilityPageShell
      backHref={context?.pagePath ?? "/venues"}
      backLabel="Back"
      eyebrow="Operator & vendor lane"
      title={claimPageTitle(context)}
      description={claimPageLead(context)}
    >
      <div className="utility-page__stack space-y-4">
        <ClaimInquiryForm context={context} />

        <aside className="utility-aside media-panel-card px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--media-orange-deep)]">
            Verified vendor support
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--media-ink-muted)] sm:text-sm">
            Coming soon: verified operator tools so you can refresh menus and stands without
            waiting on email. For now, we handle updates manually.
          </p>
          <p className="mt-4 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--media-ink-dim)]">
            Official partner features (preview)
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[var(--media-ink-muted)] sm:text-sm">
            {teasers.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </aside>

        <p className="text-center text-sm leading-relaxed text-[var(--media-ink-muted)]">
          {PUBLIC_TRUST_STATEMENT}
        </p>
        <p className="text-center text-xs leading-snug text-[var(--media-ink-dim)]">
          {PROMOTED_PLACEMENT_NOTE}
        </p>
      </div>
    </UtilityPageShell>
  );
}
