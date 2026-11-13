import sharp from "sharp";
import { readdir, mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** Match the curved four-point silhouette, not just white pixels or a fixed coordinate.
 * Correlation uses locally high-passed brightness, so cloth/wood brightness is suppressed.
 * The score is a shape correlation, not a calibrated probability of correctness.
 */
export async function detectMark(input) {
  const { width, height } = await sharp(input).metadata();
  const roi = { left: Math.floor(width * .92), top: Math.floor(height * .92), width: Math.ceil(width * .08), height: Math.ceil(height * .08) };
  roi.width = width - roi.left; roi.height = height - roi.top;
  const scale = 128 / Math.max(roi.width, roi.height);
  const w = Math.round(roi.width * scale), h = Math.round(roi.height * scale);
  const rgb = await sharp(input).extract(roi).resize(w, h).removeAlpha().toColourspace("srgb").raw().toBuffer();
  // The translucent pale mark raises all channels, unlike a bright red thread.
  const raw = Buffer.alloc(w * h);
  for (let i = 0; i < raw.length; i++) raw[i] = Math.round((Math.min(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]) + (rgb[i * 3] + rgb[i * 3 + 1] + rgb[i * 3 + 2]) / 3) / 2);
  const blurred = await sharp(raw, { raw: { width: w, height: h, channels: 1 } }).blur(12).greyscale().raw().toBuffer();
  const signal = Float64Array.from(raw, (value, i) => value - blurred[i]);
  let best = { confidence: 0 };
  // A four-ray mark occupies 2–6% of the image width; the position tolerance is calibrated below.
  for (const exponent of [.5, .65, .8, 1]) for (let radius = 20; radius <= 44; radius += 2) {
    const size = radius * 2 + 9, center = (size - 1) / 2;
    const mask = Buffer.alloc(size * size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      if ((Math.abs(x - center) / radius) ** exponent + (Math.abs(y - center) / radius) ** exponent <= 1) mask[y * size + x] = 255;
    }
    const smooth = await sharp(mask, { raw: { width: size, height: size, channels: 1 } }).blur(12).greyscale().raw().toBuffer();
    const samples = [];
    for (let y = 0; y < size; y += 3) for (let x = 0; x < size; x += 3) {
      const v = mask[y * size + x] - smooth[y * size + x];
      samples.push([x - center, y - center, v]);
    }
    // Calibration from the visibly confirmed overlay in these originals: centre about
    // (95.3%, 93.8%) of the photograph. Search a tolerance around that generator placement;
    // arbitrary pale stars elsewhere in the photo are deliberately outside this detector's scope.
    for (let cy = Math.floor(h * .16); cy < h * .3; cy += 2) for (let cx = Math.ceil(w * .35); cx < w * .5; cx += 2) {
      let dot = 0, energy = 0, norm = 0, count = 0;
      const quadrants = Array.from({ length: 4 }, () => [0, 0, 0]);
      for (const [dx, dy, v] of samples) {
        if (cx + dx < 0 || cx + dx >= w || cy + dy < 0 || cy + dy >= h) continue;
        const pixel = signal[(cy + dy) * w + cx + dx];
        dot += pixel * v; energy += pixel * pixel; norm += v * v; count++;
        const q = quadrants[(dx >= 0 ? 1 : 0) + (dy >= 0 ? 2 : 0)];
        q[0] += pixel * v; q[1] += pixel * pixel; q[2] += v * v;
      }
      if (count < samples.length * .65) continue;
      const score = dot / Math.sqrt(norm * energy || 1);
      const weakestQuadrant = Math.min(...quadrants.map(([d, e, n]) => d / Math.sqrt(e * n || 1)));
      if (weakestQuadrant < 0) continue;
      if (score > best.confidence) best = { confidence: score, cx, cy, radius, weakestQuadrant };
    }
  }
  const found = best.confidence >= .37;
  const bbox = found ? {
    left: Math.round(roi.left + (best.cx - best.radius) / scale),
    top: Math.round(roi.top + (best.cy - best.radius) / scale),
    width: Math.ceil(best.radius * 2 / scale), height: Math.ceil(best.radius * 2 / scale)
  } : null;
  return { width, height, found, bbox, confidence: +best.confidence.toFixed(3), weakestQuadrant: +(best.weakestQuadrant ?? 0).toFixed(3) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const directory = process.argv.includes("--verify") ? "recipes-web" : "recipes";
  const source = path.join(root, "public/images", directory);
  const rows = [];
  for (const file of (await readdir(source)).filter(file => /\.(png|webp)$/.test(file) && !file.includes("-card")).sort()) {
    rows.push({ file, ...await detectMark(path.join(source, file)) });
  }
  const outputArg = process.argv.find(arg => arg.startsWith("--output="))?.slice(9);
  const output = path.resolve(root, outputArg || "../../docs/redesign/shots/images");
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, `${directory}-marks.json`), JSON.stringify(rows, null, 2) + "\n");
  console.table(rows.map(({ file, found, bbox, confidence }) => ({ file, found, bbox: bbox ? `${bbox.left},${bbox.top},${bbox.width},${bbox.height}` : "—", confidence })));
  if (process.argv.includes("--verify")) {
    const exceptions = JSON.parse(await readFile(new URL("./image-crop-exceptions.json", import.meta.url), "utf8"));
    const unexpected = rows.filter(row => row.found && !exceptions[row.file.replace(/\.webp$/, ".png")]);
    console.log(JSON.stringify({ remainingMarks: rows.filter(row => row.found).map(row => row.file), unexpectedMarks: unexpected.map(row => row.file), compositionExceptions: rows.filter(row => row.found && exceptions[row.file.replace(/\.webp$/, ".png")]).map(row => row.file) }));
    if (unexpected.length) process.exitCode = 1;
  }
}
