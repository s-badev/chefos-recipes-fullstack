import type { CSSProperties, ReactNode } from "react";
import { StitchRing } from "./stitch";

/**
 * The round table of the Sofra: the cloth, the stitched ring and the centre. Shared by the turning
 * table on the home page (which adds its plates as children), the empty Favorites and the 404.
 */
export function SofraBoard({ className = "sofra", style, center, children }: {
  className?: string; style?: CSSProperties; center: ReactNode; children?: ReactNode;
}) {
  return (
    <div className={className} style={style}>
      <div className="sofra-table" />
      <div className="sofra-ring"><StitchRing /></div>
      <div aria-hidden="true" className="sofra-center"><div>{center}</div></div>
      {children}
    </div>
  );
}
