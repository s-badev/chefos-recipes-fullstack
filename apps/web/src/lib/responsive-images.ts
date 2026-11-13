import manifest from "./image-variants.json";

export type ImageUse = "card" | "thumbnail" | "wide";
const available: Record<string, number[]> = manifest;

export function responsiveImage(src: string, use: ImageUse = "card") {
  const name = /^\/images\/(?:recipes-web|recipes)\/([a-z0-9-]+)\.(?:webp|png)$/.exec(src)?.[1];
  if (!name || !available[name]) return null;
  const widths = available[name].filter(width => use === "thumbnail" ? width <= 480 : width >= 480 && (use === "wide" || width <= 1200));
  if (!widths.length) return null;
  const url = (width: number, format: string) => `/images/recipes-responsive/${name}-${width}.${format}`;
  return {
    widths,
    fallback: url(widths[0], "webp"),
    preload: url(widths[0], "avif"),
    avif: widths.map(width => `${url(width, "avif")} ${width}w`).join(", "),
    webp: widths.map(width => `${url(width, "webp")} ${width}w`).join(", ")
  };
}
