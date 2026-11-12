import { useId } from "react";

/**
 * Bulgarian cross-stitch ornaments, generated with the same algorithm as the approved mock
 * (docs/redesign/sofra-mock.html: xs, bandCells, starSVG, ringSVG). Pure SVG in currentColor,
 * decorative only (aria-hidden), no raster images.
 */
type Cell = readonly [number, number];

/** One cross stitch per cell: two diagonals inset by 18% of the cell. */
function crossPath(cells: readonly Cell[], unit: number): string {
  const inset = unit * 0.18;
  return cells.map(([cx, cy]) => {
    const x = cx * unit, y = cy * unit;
    return `M${x + inset} ${y + inset}L${x + unit - inset} ${y + unit - inset}M${x + unit - inset} ${y + inset}L${x + inset} ${y + unit - inset}`;
  }).join("");
}

/** "Ромб с кука" repeat, 16×9 cells. */
function bandCells(): { cells: Cell[]; width: number; height: number } {
  const cells: Cell[] = [], width = 16, height = 9;
  for (let x = 0; x < width; x++) if (x % 2 === 0) { cells.push([x, 0]); cells.push([x, height - 1]); }
  for (let y = 1; y < height - 1; y++) {
    for (let x = 0; x < width; x++) {
      const dx = Math.abs(x - 7), dy = Math.abs(y - 4);
      if (dx + dy === 3 || (dx === 0 && dy === 0) || (dx + dy === 1 && dx === dy)) cells.push([x, y]);
      if ((x === 15 || x === 0) && dy <= 1) cells.push([x, y]);
    }
  }
  return { cells, width, height };
}

/** Eight-pointed star, 15×15 cells. */
function starCells(): Cell[] {
  const cells: Cell[] = [], size = 15, middle = 7;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.abs(x - middle), dy = Math.abs(y - middle);
      const arm = (dx <= 1 && dy <= 6 && dy >= 2) || (dy <= 1 && dx <= 6 && dx >= 2);
      const diagonal = dx === dy && dx >= 2 && dx <= 5;
      const core = dx + dy === 2 || (dx === 0 && dy === 0);
      if ((arm && !(dx === 1 && dy === 1)) || diagonal || core) cells.push([x, y]);
    }
  }
  return cells;
}

/** Stitches around a circle: 96 on the outer ring, 48 lighter ones inside. */
function ringPath(count: number, radius: number, size: number, offset: number): string {
  let d = "";
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + offset;
    const x = 50 + Math.cos(angle) * radius, y = 50 + Math.sin(angle) * radius;
    d += `M${x - size} ${y - size}L${x + size} ${y + size}M${x + size} ${y - size}L${x - size} ${y + size}`;
  }
  return d;
}

const BAND = bandCells();
const STAR = crossPath(starCells(), 10);
const RING_OUTER = ringPath(96, 45, 0.9, 0);
const RING_INNER = ringPath(48, 40, 0.7, 0.06);

/**
 * A repeating border across the full width. `size` is the stitch cell in px: 3.4 for the regular
 * band (30px tall), 2 for the thin band under photographs (18px).
 */
export function StitchBand({ className = "", size = 3.4 }: { className?: string; size?: number }) {
  const id = useId().replace(/:/g, "");
  const width = BAND.width * size, height = BAND.height * size;
  return (
    <svg aria-hidden="true" className={`stitch-band ${className}`} focusable="false" height={height} preserveAspectRatio="none" width="100%">
      <defs>
        <pattern height={height} id={`band-${id}`} patternUnits="userSpaceOnUse" width={width} x="0" y="0">
          <path d={crossPath(BAND.cells, size)} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={1.3} />
        </pattern>
      </defs>
      <rect fill={`url(#band-${id})`} height={height} width="100%" />
    </svg>
  );
}

export function StitchStar({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`stitch-star ${className}`} focusable="false" viewBox="0 0 150 150">
      <path d={STAR} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2} />
    </svg>
  );
}

export function StitchRing({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`stitch-ring ${className}`} focusable="false" viewBox="0 0 100 100">
      <path d={RING_OUTER} stroke="currentColor" strokeLinecap="round" strokeWidth={0.45} />
      <path d={RING_INNER} opacity={0.6} stroke="currentColor" strokeLinecap="round" strokeWidth={0.35} />
    </svg>
  );
}
