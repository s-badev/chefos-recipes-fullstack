import { expect, test } from "@playwright/test";
import { catalogVariants } from "../src/lib/catalog-layout";

const SPAN = { wide: 6, half: 3, solo: 12 } as const;

test("catalog layout: every row of the 12-column grid is full for any count (24 curated + 0…40 manual, and filters)", () => {
  for (let count = 1; count <= 64; count++) {
    const layout = catalogVariants(count);
    expect(layout, `count ${count}`).toHaveLength(count);
    let row = 0;
    for (const variant of layout) { row += SPAN[variant]; if (row === 12) row = 0; expect(row, `count ${count}: a card crosses the row end`).toBeLessThan(12); }
    expect(row, `count ${count}: the last row is not full`).toBe(0);
  }
});

test("catalog layout: the tail rules (1 across, 2 equal, 4 as two pairs) and the six-card pattern", () => {
  expect(catalogVariants(25).slice(24)).toEqual(["solo"]);
  expect(catalogVariants(26).slice(24)).toEqual(["wide", "wide"]);
  expect(catalogVariants(28).slice(24)).toEqual(["wide", "wide", "wide", "wide"]);
  expect(catalogVariants(6)).toEqual(["wide", "half", "half", "half", "half", "wide"]);
  expect(catalogVariants(1)).toEqual(["solo"]);
});
