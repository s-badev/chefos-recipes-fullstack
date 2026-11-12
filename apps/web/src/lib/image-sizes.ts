// Match .wrap (--max:1320px, --gut:clamp(16px,4vw,56px)) and the 24px grid gap.
const content = "min(100vw, 1320px) - clamp(32px, 8vw, 112px)";
const full = `calc(${content})`;
const half = `calc((${content} - 24px) / 2)`;
const quarter = `calc((${content} - 72px) / 4)`;
const third = `calc((${content} - 48px) / 3)`;

export const recipeTileSizes = {
  big: `(max-width: 1000px) ${full}, ${half}`,
  wide: `(max-width: 640px) ${full}, ${half}`,
  half: `(max-width: 640px) ${full}, (max-width: 1000px) ${half}, ${quarter}`,
  "": `(max-width: 640px) ${full}, (max-width: 1000px) ${half}, ${third}`
};

// Seven of twelve columns with six internal 24px gaps: 7/12 * content - 10px.
export const weeklyImageSizes = `(max-width: 1000px) ${full}, calc((${content}) * 7 / 12 - 10px)`;
