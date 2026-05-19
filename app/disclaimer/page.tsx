import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal-page-layout";
import { DISCLAIMER_SECTIONS } from "@/lib/legal-content";
import { getAbsoluteUrl } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important limitations for Stadium Slop — independent fan guide, not affiliated with teams or venues.",
  alternates: { canonical: getAbsoluteUrl("/disclaimer") }
};

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      description="Stadium Slop is fan-powered opinion. Read this before relying on scores, menus, or photos."
      sections={DISCLAIMER_SECTIONS}
    />
  );
}
