import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal-page-layout";
import { TERMS_SECTIONS } from "@/lib/legal-content";
import { getAbsoluteUrl } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of Use for Stadium Slop — fan-powered stadium food reviews operated by SNG LABS LLC.",
  alternates: { canonical: getAbsoluteUrl("/terms") }
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Use"
      description="Rules for using Stadium Slop, including fan reviews, photos, moderation, and intellectual property."
      sections={TERMS_SECTIONS}
    />
  );
}
