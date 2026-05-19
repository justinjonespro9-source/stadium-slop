import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal-page-layout";
import { PRIVACY_SECTIONS } from "@/lib/legal-content";
import { getAbsoluteUrl } from "@/lib/site-metadata";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Stadium Slop collects, uses, and protects information when you browse, review, and share fan content.",
  alternates: { canonical: getAbsoluteUrl("/privacy") }
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="What we collect, how we use it, and your choices when you use our fan-powered guide."
      sections={PRIVACY_SECTIONS}
    />
  );
}
