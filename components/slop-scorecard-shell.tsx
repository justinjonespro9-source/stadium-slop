import type { ReactNode } from "react";

/** Trading-card shell: gold outer trim + navy body (no decorative layers). */
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
      <div className="slop-scorecard-collectible-gold slop-scorecard-chamfer">
        <div className="slop-scorecard-collectible-inner">{children}</div>
      </div>
    </div>
  );
}
