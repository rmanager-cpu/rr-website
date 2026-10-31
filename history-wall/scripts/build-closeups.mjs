// Close-ups for every traced frame, cut from the full-resolution originals in source/.
//
//   npm run closeups
//
// The wall photos on the site top out at 4096px wide (the stitched wall is 10150px), so enlarging a
// frame from them throws away more than half the detail. This cuts each frame from the original
// instead, straightened from its four traced corners, and writes public/frames/<id>.webp plus
// src/data/closeups.json (id -> file). A frame that shows on more than one section is cut from the
// one where it's largest. A hand-picked `closeup` in frames.json (e.g. a straight-on photo of the
// frame) always wins over these.
//
// Straight-on photos win: put a phone photo of a frame in source/closeups/, named by its tag number
// (41.jpg for frame No. 41) or its id (u-letter.jpg), and it replaces the cut from the wall.
//
// Only real pixels: no upscaling, no enhancement. Run again after re-tracing outlines or adding photos.

import sharp from 'sharp';
import { createRequire } from 'node:module';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
const cv = require('@techstark/opencv-js');
await new Promise((r) => (cv.Mat ? r() : (cv.onRuntimeInitialized = r)));

const MAX_SIDE = 1800; // long side of a close-up, in px (never larger than the source allows)
const PAD = 0.035; // a little wall around the frame so its edge isn't clipped
const QUALITY = 84;

const sections = JSON.parse(await readFile('src/data/sections.json', 'utf8'));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// 1. Every outline, in source pixels; keep the largest per frame.
const best = new Map();
for (const { id: section } of sections) {
  const geoFile = `src/data/geometry/${section}.json`;
  const src = `source/${section}.jpg`;
  if (!existsSync(geoFile) || !existsSync(src)) continue;
  const { width: W, height: H } = await sharp(src).rotate().metadata().then((m) =>
    (m.orientation ?? 1) >= 5 ? { width: m.height, height: m.width } : m,
  );
  for (const h of JSON.parse(await readFile(geoFile, 'utf8')).hotspots) {
    let pts = h.points.map(([x, y]) => [x * W, y * H]);
    // Ovals and odd shapes: cut their bounding box, unstraightened.
    if (pts.length !== 4) {
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const [l, t, r, b] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
      pts = [[l, t], [r, t], [r, b], [l, b]];
    }
    const w = (dist(pts[0], pts[1]) + dist(pts[3], pts[2])) / 2;
    const ht = (dist(pts[0], pts[3]) + dist(pts[1], pts[2])) / 2;
    if (!(best.get(h.frame)?.area > w * ht)) best.set(h.frame, { section, src, W, H, pts, w, h: ht, area: w * ht });
  }
}

// 2. Cut and straighten each one.
await rm('public/frames', { recursive: true, force: true });
await mkdir('public/frames', { recursive: true });
const out = {};
for (const [id, f] of [...best].sort()) {
  // Grow the quad a little around its centre.
  const cx = f.pts.reduce((s, p) => s + p[0], 0) / 4, cy = f.pts.reduce((s, p) => s + p[1], 0) / 4;
  const quad = f.pts.map(([x, y]) => [cx + (x - cx) * (1 + 2 * PAD), cy + (y - cy) * (1 + 2 * PAD)]);
  // Work on just the bounding box, so we never load a 10k-pixel image into OpenCV.
  const x0 = Math.max(0, Math.floor(Math.min(...quad.map((p) => p[0]))));
  const y0 = Math.max(0, Math.floor(Math.min(...quad.map((p) => p[1]))));
  const x1 = Math.min(f.W, Math.ceil(Math.max(...quad.map((p) => p[0]))));
  const y1 = Math.min(f.H, Math.ceil(Math.max(...quad.map((p) => p[1]))));
  const { data, info } = await sharp(f.src).rotate().extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const scale = Math.min(1, MAX_SIDE / Math.max(f.w, f.h));
  const ow = Math.round(f.w * (1 + 2 * PAD) * scale), oh = Math.round(f.h * (1 + 2 * PAD) * scale);
  const srcMat = cv.matFromImageData({ data: new Uint8ClampedArray(data), width: info.width, height: info.height });
  const from = cv.matFromArray(4, 1, cv.CV_32FC2, quad.flatMap(([x, y]) => [x - x0, y - y0]));
  const to = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, ow, 0, ow, oh, 0, oh]);
  const M = cv.getPerspectiveTransform(from, to);
  const dst = new cv.Mat();
  cv.warpPerspective(srcMat, dst, M, new cv.Size(ow, oh), cv.INTER_CUBIC, cv.BORDER_REPLICATE);
  await sharp(Buffer.from(dst.data), { raw: { width: ow, height: oh, channels: 4 } })
    .removeAlpha()
    .webp({ quality: QUALITY })
    .toFile(`public/frames/${id}.webp`);
  [srcMat, from, to, M, dst].forEach((m) => m.delete());
  out[id] = `frames/${id}.webp`;
  console.log(`${id.padEnd(22)} ${f.section.padEnd(8)} ${ow}x${oh}`);
}
// 3. Straight-on photos of single frames replace the cuts.
const PHOTO_DIR = 'source/closeups';
if (existsSync(PHOTO_DIR)) {
  const { readdir } = await import('node:fs/promises');
  for (const file of await readdir(PHOTO_DIR)) {
    const m = file.match(/^(.+)\.(jpe?g|png|heic|webp)$/i);
    if (!m) continue;
    const id = /^\d+$/.test(m[1]) ? `f${m[1]}` : m[1];
    await sharp(`${PHOTO_DIR}/${file}`).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY }).toFile(`public/frames/${id}.webp`);
    out[id] = `frames/${id}.webp`;
    console.log(`${id.padEnd(22)} photo    ${file}`);
  }
}

await writeFile('src/data/closeups.json', JSON.stringify(out, null, 1) + '\n');
console.log(`\n${Object.keys(out).length} close-ups written to public/frames/`);
