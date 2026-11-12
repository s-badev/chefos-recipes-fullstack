import sharp from "sharp";

/** Small four-ray mask with a 5px outward feather; other decoded pixels stay exact. */
export function textureMask(width, height) {
  const size = Math.round(width * .056), radius = width * .021;
  const left = Math.round(width * .953) - Math.floor(size / 2);
  const top = Math.round(height * .938) - Math.floor(size / 2);
  const hard = new Uint8Array(size * size), mask = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = Math.max(0, Math.abs(x - size / 2) - 3) / radius;
    const dy = Math.max(0, Math.abs(y - size / 2) - 3) / radius;
    if (dx ** .65 + dy ** .65 <= 1) hard[y * size + x] = 255;
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = y * size + x;
    if (hard[i]) { mask[i] = 255; continue; }
    let distance = 6;
    for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
      if (x + dx < 0 || x + dx >= size || y + dy < 0 || y + dy >= size) continue;
      if (hard[(y + dy) * size + x + dx]) distance = Math.min(distance, Math.hypot(dx, dy));
    }
    if (distance < 5) mask[i] = Math.round(255 * (1 - distance / 5));
  }
  return { left, top, width: size, height: size, mask };
}

export async function repairTexture(input, sigmas = [0]) {
  const { data: before, info } = await sharp(input).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const levels = [];
  for (const sigma of sigmas) levels.push({ sigma, data: sigma ? await sharp(before, { raw: { width, height, channels: 3 } }).blur(sigma).raw().toBuffer() : before });
  const target = textureMask(width, height);
  const samples = [];
  for (let y = 0; y < target.height; y += 2) for (let x = 0; x < target.width; x += 2) {
    const a = target.mask[y * target.width + x];
    if (a > 0 && a < 95) samples.push((target.top + y) * width + target.left + x);
  }
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function score(dx, dy, level) {
    if (Math.abs(dx) < target.width && Math.abs(dy) < target.height) return null;
    if (target.left + dx < 0 || target.top + dy < 0 || target.left + dx + target.width > width || target.top + dy + target.height > height) return null;
    const sums = [0, 0, 0], squares = [0, 0, 0];
    const offset = (dy * width + dx) * 3;
    for (const pixel of samples) for (let c = 0; c < 3; c++) {
      const delta = before[pixel * 3 + c] - levels[level].data[pixel * 3 + c + offset];
      sums[c] += delta; squares[c] += delta * delta;
    }
    const correction = sums.map(sum => clamp(sum / samples.length, -12, 12));
    const error = correction.reduce((total, shift, c) => total + (squares[c] - 2 * shift * sums[c]) / samples.length + 2 * shift * shift, 0);
    return { dx, dy, correction, error, level };
  }
  let best;
  for (let level = 0; level < levels.length; level++) for (let dy = -240; dy <= 36; dy += 3) for (let dx = -240; dx <= 36; dx += 3) {
    const candidate = score(dx, dy, level);
    if (candidate && (!best || candidate.error < best.error)) best = candidate;
  }
  if (!best) throw new Error("No valid adjacent texture donor");
  const coarse = best;
  for (let dy = coarse.dy - 3; dy <= coarse.dy + 3; dy++) for (let dx = coarse.dx - 3; dx <= coarse.dx + 3; dx++) {
    const candidate = score(dx, dy, coarse.level);
    if (candidate && candidate.error < best.error) best = candidate;
  }
  const after = Buffer.from(before);
  let changedPixels = 0;
  for (let y = 0; y < target.height; y++) for (let x = 0; x < target.width; x++) {
    const a = target.mask[y * target.width + x] / 255;
    if (!a) continue;
    const destination = ((target.top + y) * width + target.left + x) * 3;
    const source = destination + (best.dy * width + best.dx) * 3;
    let changed = false;
    for (let c = 0; c < 3; c++) {
      const donor = clamp(levels[best.level].data[source + c] + best.correction[c], 0, 255);
      after[destination + c] = Math.round(before[destination + c] * (1 - a) + donor * a);
      changed ||= after[destination + c] !== before[destination + c];
    }
    if (changed) changedPixels++;
  }
  // Lossless is essential: a second lossy encode would change pixels outside the mask.
  const encoded = await sharp(after, { raw: { width, height, channels: 3 } }).webp({ lossless: true, effort: 6 }).toBuffer();
  const decoded = await sharp(encoded).removeAlpha().toColourspace("srgb").raw().toBuffer();
  if (!decoded.equals(after)) throw new Error("Lossless round trip changed pixels");
  return { encoded, width, height, target: { left: target.left, top: target.top, width: target.width, height: target.height }, donor: { left: target.left + best.dx, top: target.top + best.dy, width: target.width, height: target.height }, donorBlurSigma: levels[best.level].sigma, correction: best.correction.map(value => +value.toFixed(2)), boundaryMse: +best.error.toFixed(2), changedPixels, outsideMaskChanged: 0 };
}
