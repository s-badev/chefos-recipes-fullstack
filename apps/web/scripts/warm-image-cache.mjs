import { readFile } from "node:fs/promises";
const names = JSON.parse(await readFile(new URL("../src/lib/web-images.json", import.meta.url), "utf8"));
// Finish image responses before UI tests start closing/navigating pages. This avoids an
// interrupted cold optimizer response leaving a pending request in the local Next server.
// Browser transfer measurements still disable the browser cache and count every response.
for (const name of names) for (const width of [96, 256, 384, 640, 750, 828, 1080, 1200, 1920]) for (const quality of [55, 60, 75]) {
  const source = encodeURIComponent(`/images/recipes-web/${name}.webp`);
  const response = await fetch(`http://localhost:3000/_next/image?url=${source}&w=${width}&q=${quality}`, { headers: { Accept: "image/avif,image/webp" }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Image warmup failed: ${name}, ${width}, HTTP ${response.status}`);
  await response.arrayBuffer();
}
console.log(`Warmed ${names.length * 27} local image variants; no application data written.`);
