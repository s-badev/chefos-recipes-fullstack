import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { detectMark } from "./detect-image-marks.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
export async function checkVariantMarks() {
  const manifest = JSON.parse(await readFile(path.join(root, "src/lib/image-variants.json"), "utf8"));
  const rows = [];
  for (const [name, widths] of Object.entries(manifest)) {
    const parent = await detectMark(path.join(root, "public/images/recipes-web", `${name}.webp`));
    if (parent.found) continue; // Existing, deliberately retained marks are not a derivative regression.
    for (const width of widths.filter(width => [480, 640, 800, 1200].includes(width))) for (const format of ["avif", "webp"]) {
      const file = `${name}-${width}.${format}`;
      rows.push({ file, parentConfidence: parent.confidence, ...await detectMark(path.join(root, "public/images/recipes-responsive", file)) });
    }
  }
  await writeFile(path.resolve(root, "../../docs/redesign/shots/sofra/round3/variant-mark-checks.json"), JSON.stringify(rows, null, 2) + "\n");
  return rows;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = await checkVariantMarks();
  console.log(JSON.stringify({ checked: rows.length, detected: rows.filter(row => row.found) }));
  if (rows.some(row => row.found)) process.exitCode = 1;
}
