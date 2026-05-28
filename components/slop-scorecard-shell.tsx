import type { ReactNode } from "react";

/** Trading-card shell — chamfered face with a single orange rim (no outer mat/frame). */
export function SlopScorecardFrame({
  face,
  children,
  className = ""
}: {
  face: "front" | "back";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`slop-scorecard-collectible slop-scorecard-collectible--${face} ${className}`.trim()}
      data-face={face}
    >
      <div className="slop-scorecard-collectible-frame slop-scorecard-chamfer">
        <div className="slop-scorecard-collectible-inner">{children}</div>
        <div className="slop-scorecard-collectible-corners" aria-hidden="true" />
      </div>
    </div>
  );
}
