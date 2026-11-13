/** The catalog's card sizes on the 12-column grid: wide = 6, half = 3, solo = the whole row (photo 7/12, text 5/12). */
export type CatalogVariant = "wide" | "half" | "solo";

/** Two full rows per six cards: wide + half + half, then half + half + wide (as in the approved mock). */
const PATTERN: CatalogVariant[] = ["wide", "half", "half", "half", "half", "wide"];

/**
 * The tail after the last full set of six never leaves empty columns and never a lone card on half a row:
 * 1 → one card across the row; 2 → two equal; 3 → wide + half + half; 4 → two rows of two; 5 → a full
 * row and two equal. Works for any count (the catalog is 24 curated + manual admin recipes, and filters).
 */
export function catalogVariants(count: number): CatalogVariant[] {
  const rest = count % 6;
  const tail: Record<number, CatalogVariant[]> = {
    0: [], 1: ["solo"], 2: ["wide", "wide"], 3: ["wide", "half", "half"],
    4: ["wide", "wide", "wide", "wide"], 5: ["wide", "half", "half", "wide", "wide"]
  };
  return [...Array.from({ length: count - rest }, (_, index) => PATTERN[index % 6]), ...tail[rest]];
}
