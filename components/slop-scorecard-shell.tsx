import type { ReactNode } from "react";

/** Premium trading-card frame: gunmetal rim → gold trim → crimson accent → inner. */
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
        <div className="slop-scorecard-collectible-outer">
          <div className="slop-scorecard-collectible-gold">
            <div className="slop-scorecard-collectible-accent">
              <div className="slop-scorecard-collectible-inner">{children}</div>
            </div>
          </div>
        </div>
        <div className="slop-scorecard-collectible-corners" aria-hidden="true" />
        <span className="slop-scorecard-collectible-mark" aria-hidden="true">
          Stadium Slop
        </span>
      </div>
    </div>
  );
}
