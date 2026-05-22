import type { ReactNode } from "react";

/** Stadium Slop collectible frame — navy base, gold trim, clipped corners. */
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
      className={`slop-scorecard-frame slop-scorecard-frame--${face} ${className}`.trim()}
      data-face={face}
    >
      <div className="slop-scorecard-frame-inner">{children}</div>
    </div>
  );
}
