/** Reserve the rotated image's full bounding box, not just its unrotated size. */
export const PREVIEW_WIDTH = 300;
export const PREVIEW_HEIGHT = 225;
export const PREVIEW_TILT = 4;
const EDGE = 8, GAP = 16, radians = PREVIEW_TILT * Math.PI / 180;
const overhangX = (PREVIEW_WIDTH * Math.cos(radians) + PREVIEW_HEIGHT * Math.sin(radians) - PREVIEW_WIDTH) / 2;
const overhangY = (PREVIEW_HEIGHT * Math.cos(radians) + PREVIEW_WIDTH * Math.sin(radians) - PREVIEW_HEIGHT) / 2;

export type PreviewRow = { top: number; bottom: number };
export type PreviewPoint = { x: number; y: number };

export function previewTarget(row: PreviewRow, pointerX: number, width: number, height: number): PreviewPoint | null {
  const minX = EDGE + overhangX, maxX = width - PREVIEW_WIDTH - EDGE - overhangX;
  const minY = EDGE + overhangY, maxY = height - PREVIEW_HEIGHT - EDGE - overhangY;
  if (maxX < minX || maxY < minY) return null;
  const above = row.top - GAP - PREVIEW_HEIGHT - overhangY;
  const below = row.bottom + GAP + overhangY;
  const y = above >= minY && above <= maxY ? above : below >= minY && below <= maxY ? below : null;
  return y === null ? null : { x: Math.max(minX, Math.min(maxX, pointerX - PREVIEW_WIDTH / 2)), y };
}

/** A lerp may cross a newly hovered row; move to its safe side before painting. */
export function safePreviewStep(point: PreviewPoint, target: PreviewPoint, row: PreviewRow, width: number, height: number): PreviewPoint {
  const x = Math.max(EDGE + overhangX, Math.min(width - PREVIEW_WIDTH - EDGE - overhangX, point.x));
  let y = Math.max(EDGE + overhangY, Math.min(height - PREVIEW_HEIGHT - EDGE - overhangY, point.y));
  if (y - overhangY < row.bottom + GAP && y + PREVIEW_HEIGHT + overhangY > row.top - GAP) y = target.y;
  return { x, y };
}
