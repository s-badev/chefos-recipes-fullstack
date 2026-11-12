import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { detectMark } from "./detect-image-marks.mjs";
import { repairTexture } from "./texture-repair.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.resolve(root, "../../docs/redesign/shots/images-followup/texture");
const candidates = path.join(root, ".next-check/texture-candidates");
const hash = buffer => createHash("sha256").update(buffer).digest("hex");
const names = Object.keys(JSON.parse(await readFile(new URL("./image-crop-exceptions.json", import.meta.url), "utf8"))).map(name => name.replace(/\.png$/, ""));

async function pair(before, after, file, zoom) {
  const metadata = await sharp(before).metadata();
  const crop = { left: metadata.width - 280, top: metadata.height - 240, width: 280, height: 240 };
  const width = zoom ? 560 : 600, height = zoom ? 480 : 448;
  const inputs = [];
  for (const [i, source] of [before, after].entries()) {
    let image = sharp(source);
    if (zoom) image = image.extract(crop);
    inputs.push({ input: await image.resize(width, height).jpeg({ quality: 80 }).toBuffer(), left: i * width, top: 30 });
  }
  const label = Buffer.from(`<svg width="${width * 2}" height="30"><rect width="100%" height="30" fill="white"/><text x="8" y="21" font-size="17">Преди</text><text x="${width + 8}" y="21" font-size="17">След (кандидат)</text></svg>`);
  await sharp({ create: { width: width * 2, height: height + 30, channels: 3, background: "white" } }).composite([...inputs, { input: label, top: 0, left: 0 }]).jpeg({ quality: 80 }).toFile(path.join(out, file));
}

export async function runTextureRepairs(apply = false) {
  await mkdir(out, { recursive: true }); await mkdir(candidates, { recursive: true });
  if (apply) {
    const reviews = JSON.parse(await readFile(new URL("./texture-repair-review.json", import.meta.url), "utf8"));
    const rows = JSON.parse(await readFile(path.join(out, "repairs.json"), "utf8"));
    for (const row of rows) {
      row.review = reviews[row.name];
      if (!row.review?.apply) {
        if (row.applied) throw new Error(`Restore a previously applied patch before rejecting it: ${row.name}`);
        continue;
      }
      row.applied = false;
      if (row.afterMark.found || row.outsideMaskChanged !== 0) throw new Error(`Candidate failed verification: ${row.name}`);
      const output = path.join(root, "public/images/recipes-web", `${row.name}.webp`);
      const current = await readFile(output);
      if (hash(current) === row.afterHash) { row.applied = true; continue; }
      if (hash(current) !== row.beforeHash) throw new Error(`Master changed after preview: ${row.name}`);
      const candidate = await readFile(path.join(candidates, `${row.name}.webp`));
      if (hash(candidate) !== row.afterHash) throw new Error(`Candidate checksum mismatch: ${row.name}`);
      await writeFile(output, candidate); row.applied = true;
    }
    await writeFile(path.join(out, "repairs.json"), JSON.stringify(rows, null, 2) + "\n");
    console.table(rows.map(({ name, applied, review }) => ({ name, applied, review: review?.note })));
    return;
  }
  const rows = [];
  const previous = await readFile(path.join(out, "repairs.json"), "utf8").then(JSON.parse).catch(error => { if (error.code === "ENOENT") return []; throw error; });
  for (const name of names) {
    const before = await readFile(path.join(root, "public/images/recipes-web", `${name}.webp`));
    const beforeMark = await detectMark(before);
    if (!beforeMark.found) {
      const applied = previous.find(row => row.name === name && row.applied && row.afterHash === hash(before));
      if (!applied) throw new Error(`No mark and no matching repair history: ${name}`);
      rows.push(applied); console.log(`${name}: already repaired; retained existing evidence`); continue;
    }
    const sigmas = ["palneni-chushki-s-oriz", "sarmi-s-kiselo-zele"].includes(name) ? [.6] : [0];
    const { encoded, ...result } = await repairTexture(before, sigmas);
    const afterMark = await detectMark(encoded);
    await writeFile(path.join(candidates, `${name}.webp`), encoded);
    await pair(before, encoded, `${name}-full.jpg`, false);
    await pair(before, encoded, `${name}-zoom.jpg`, true);
    rows.push({ name, beforeHash: hash(before), afterHash: hash(encoded), beforeBytes: before.length, afterBytes: encoded.length, beforeMark, afterMark, ...result, applied: false });
    console.log(JSON.stringify({ name, donor: result.donor, boundaryMse: result.boundaryMse, afterConfidence: afterMark.confidence, found: afterMark.found, bytes: encoded.length }));
  }
  await writeFile(path.join(out, "repairs.json"), JSON.stringify(rows, null, 2) + "\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await runTextureRepairs(process.argv.includes("--apply"));
