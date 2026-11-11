import availableImages from "./web-images.json";

const images = new Set(availableImages);

/** Only generated files in the web image manifest replace stored PNG paths. */
export function webImageSrc(src: string): string {
  const name = /^\/images\/recipes\/([^/]+)\.png$/.exec(src)?.[1];
  return name && images.has(name) ? `/images/recipes-web/${name}.webp` : src;
}
