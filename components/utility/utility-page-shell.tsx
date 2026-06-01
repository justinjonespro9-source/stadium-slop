import type { ReactNode } from "react";

import { DiscoveryPageHero } from "@/components/discovery/discovery-page-hero";

type UtilityPageShellProps = {
  backHref?: string;
  backLabel?: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** `narrow` for forms (~2xl); `legal` for policy prose (~3xl). */
  contentWidth?: "narrow" | "legal";
};

export function UtilityPageShell({
  backHref = "/",
  backLabel = "Stadium Slop home",
  eyebrow,
  title,
  description,
  children,
  contentWidth = "narrow"
}: UtilityPageShellProps) {
  const widthClass =
    contentWidth === "legal" ? "utility-page__content--legal" : "utility-page__content--narrow";

  return (
    <main className="media-page-shell utility-page min-h-screen">
      <DiscoveryPageHero
        backHref={backHref}
        backLabel={backLabel}
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className={`media-discovery-content utility-page__content ${widthClass}`}>
        {children}
      </div>
    </main>
  );
}
