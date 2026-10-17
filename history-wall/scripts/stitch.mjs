// Stitches overlapping shots of one flat stretch of wall into a single image.
//
//   node scripts/stitch.mjs <name> <shot1> <shot2> ... [--outlines]
//   e.g. node scripts/stitch.mjs wall host middle exit --outlines
//
// Reads  source/shots/<name>/<shot>.jpg, listed left to right, overlapping neighbours.
// Writes source/<name>.jpg (then run `npm run images`).
// With --outlines, also converts source/shots/<name>/outlines/<shot>.json (frames traced on each shot)
// into src/data/geometry/<name>.json. Leave it off once outlines have been edited on the stitched wall.
//
// How: the wall is a plane, so each neighbour maps onto the middle shot by a homography, found from
// AKAZE feature matches with RANSAC. A small extra correction squares the result up (frame edges
// level and plumb). Exposure is matched per channel in the overlaps, and each join follows the
// lowest-difference path through the overlap, feathered over a few pixels.
import sharp from 'sharp';
import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const withOutlines = args.includes('--outlines');
const [name, ...shots] = args.filter((a) => !a.startsWith('--'));
if (!name || shots.length < 2) {
  console.error('usage: node scripts/stitch.mjs <name> <shot1> <shot2> ... [--outlines]');
  process.exit(1);
}
const dir = `source/shots/${name}`;
const FEATHER = 14; // px either side of a join
const LOW = 0.25; // working scale for seams and exposure

// ---------- 3x3 matrix helpers (row-major arrays of 9) ----------
const mul = (a, b) => {
  const c = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) c[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j];
  return c;
};
const inv = (m) => {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((x) => x / det);
};
const ap = (m, [x, y]) => {
  const w = m[6] * x + m[7] * y + m[8];
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];
};
const I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

// ---------- load ----------
const cv = require('@techstark/opencv-js');
await new Promise((r) => (cv.Mat ? r() : (cv.onRuntimeInitialized = r)));

const imgs = [];
for (const s of shots) {
  const file = `${dir}/${s}.jpg`;
  const { data, info } = await sharp(file).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const half = await sharp(file).rotate().resize({ width: Math.round(info.width / 2) }).grayscale().raw().toBuffer({ resolveWithObject: true });
  imgs.push({ id: s, rgb: data, w: info.width, h: info.height, half });
  console.log(`${s}: ${info.width}x${info.height}`);
}

// ---------- features + homographies (each shot -> reference) ----------
const ref = Math.floor(imgs.length / 2);
function features(img) {
  const { data, info } = img.half;
  const mat = new cv.Mat(info.height, info.width, cv.CV_8UC1);
  mat.data.set(data);
  const det = new cv.AKAZE();
  const kp = new cv.KeyPointVector();
  const des = new cv.Mat();
  const none = new cv.Mat();
  det.detectAndCompute(mat, none, kp, des);
  const pts = [];
  for (let i = 0; i < kp.size(); i++) pts.push([kp.get(i).pt.x * 2, kp.get(i).pt.y * 2]);
  mat.delete(); none.delete(); det.delete(); kp.delete();
  return { pts, des };
}
const feats = imgs.map(features);
imgs.forEach((im, i) => console.log(`${im.id}: ${feats[i].pts.length} features`));

function homography(a, b) {
  // maps points of shot a onto shot b
  const bf = new cv.BFMatcher(cv.NORM_HAMMING, false);
  const mm = new cv.DMatchVectorVector();
  bf.knnMatch(feats[a].des, feats[b].des, mm, 2);
  const src = [], dst = [];
  for (let i = 0; i < mm.size(); i++) {
    const m = mm.get(i);
    if (m.size() < 2) continue;
    const m0 = m.get(0), m1 = m.get(1);
    if (m0.distance < 0.75 * m1.distance) {
      src.push(...feats[a].pts[m0.queryIdx]);
      dst.push(...feats[b].pts[m0.trainIdx]);
    }
  }
  const n = src.length / 2;
  const s = cv.matFromArray(n, 1, cv.CV_32FC2, src);
  const d = cv.matFromArray(n, 1, cv.CV_32FC2, dst);
  const mask = new cv.Mat();
  const H = cv.findHomography(s, d, cv.RANSAC, 4, mask);
  let inliers = 0;
  for (let i = 0; i < mask.rows; i++) inliers += mask.data[i];
  const out = Array.from(H.data64F);
  s.delete(); d.delete(); mask.delete(); H.delete(); bf.delete(); mm.delete();
  console.log(`${imgs[a].id} -> ${imgs[b].id}: ${n} matches, ${inliers} inliers`);
  if (inliers < 40) throw new Error(`Too few reliable matches between ${imgs[a].id} and ${imgs[b].id}`);
  return out;
}
// Chain neighbours toward the reference.
const toRef = imgs.map(() => I3);
for (let i = ref - 1; i >= 0; i--) toRef[i] = mul(toRef[i + 1], homography(i, i + 1));
for (let i = ref + 1; i < imgs.length; i++) toRef[i] = mul(toRef[i - 1], homography(i, i - 1));

// ---------- traced outlines (optional, also used to square the wall up) ----------
const outlines = imgs.map((im) => {
  const f = `${dir}/outlines/${im.id}.json`;
  return existsSync(f) ? JSON.parse(require('node:fs').readFileSync(f, 'utf8')).hotspots : [];
});
const quadsInRef = [];
imgs.forEach((im, i) =>
  outlines[i].forEach((h) => {
    if (h.points.length !== 4) return;
    const px = h.points.map(([x, y]) => ap(toRef[i], [x * im.w, y * im.h]));
    if (px.some(([x]) => !isFinite(x))) return;
    quadsInRef.push(px);
  }),
);

// Check: how well do frames traced on two shots land on each other?
{
  const byFrame = new Map();
  imgs.forEach((im, i) =>
    outlines[i].forEach((h) => {
      if (h.points.length !== 4) return;
      const px = h.points.map(([x, y]) => ap(toRef[i], [x * im.w, y * im.h]));
      (byFrame.get(h.frame) ?? byFrame.set(h.frame, []).get(h.frame)).push({ shot: im.id, px });
    }),
  );
  const errs = [];
  for (const [, list] of byFrame) if (list.length > 1) list[0].px.forEach((p, k) => errs.push(Math.hypot(p[0] - list[1].px[k][0], p[1] - list[1].px[k][1])));
  if (errs.length) console.log(`traced corners shared between shots: ${errs.length}, median gap ${median(errs).toFixed(1)} px (hand-tracing noise)`);
}

// Squaring: find a small projective correction that makes frame edges level and plumb.
function squareness(R) {
  let c = 0;
  for (const q of quadsInRef) {
    const [a, b, d, e] = q.map((p) => ap(R, p));
    const size = Math.hypot(b[0] - a[0], b[1] - a[1]) + Math.hypot(e[0] - a[0], e[1] - a[1]);
    c += ((a[1] - b[1]) ** 2 + (e[1] - d[1]) ** 2 + (a[0] - e[0]) ** 2 + (b[0] - d[0]) ** 2) / (size * size);
  }
  return c;
}
const refImg = imgs[ref];
const cx = refImg.w / 2, cy = refImg.h / 2;
const correction = ([t, k, p, q]) => {
  // about the reference centre: perspective (p, q), then shear k, then rotation t
  const T = [1, 0, -cx, 0, 1, -cy, 0, 0, 1];
  const Ti = [1, 0, cx, 0, 1, cy, 0, 0, 1];
  const P = [1, 0, 0, 0, 1, 0, p, q, 1];
  const S = [1, k, 0, 0, 1, 0, 0, 0, 1];
  const Rr = [Math.cos(t), -Math.sin(t), 0, Math.sin(t), Math.cos(t), 0, 0, 0, 1];
  return mul(Ti, mul(Rr, mul(S, mul(P, T))));
};
let R = I3;
if (quadsInRef.length >= 6) {
  let x = [0, 0, 0, 0];
  let steps = [0.01, 0.01, 1e-5, 1e-5];
  let best = squareness(correction(x));
  const start = best;
  for (let iter = 0; iter < 60; iter++) {
    let improved = false;
    for (let d = 0; d < 4; d++)
      for (const sgn of [1, -1]) {
        const y = [...x];
        y[d] += sgn * steps[d];
        const c = squareness(correction(y));
        if (c < best) { best = c; x = y; improved = true; }
      }
    if (!improved) steps = steps.map((s) => s / 2);
  }
  R = correction(x);
  console.log(`squared up: cost ${start.toFixed(4)} -> ${best.toFixed(4)} (rot ${(x[0] * 180 / Math.PI).toFixed(2)}°, shear ${x[1].toFixed(4)})`);
}

// ---------- canvas ----------
const M0 = toRef.map((H) => mul(R, H)); // shot px -> wall px (before crop)
// Crop to the traced frames (plus margin), or to the shots' union if nothing is traced.
const allFramePts = [];
// (points traced against a shot's own edge belong to cut-off frames; they don't set the crop)
imgs.forEach((im, i) =>
  outlines[i].forEach((h) =>
    h.points.forEach(([x, y]) => {
      if (x < 0.01 || x > 0.99 || y < 0.01 || y > 0.99) return;
      allFramePts.push(ap(M0[i], [x * im.w, y * im.h]));
    }),
  ),
);
const cornerPts = imgs.flatMap((im, i) => [[0, 0], [im.w, 0], [im.w, im.h], [0, im.h]].map((p) => ap(M0[i], p)));
const basis = allFramePts.length ? allFramePts : cornerPts;
let minX = Math.min(...basis.map((p) => p[0])), maxX = Math.max(...basis.map((p) => p[0]));
let minY = Math.min(...basis.map((p) => p[1])), maxY = Math.max(...basis.map((p) => p[1]));
const margin = (maxY - minY) * 0.035;
minX = Math.max(minX - margin, Math.min(...cornerPts.map((p) => p[0])));
maxX = Math.min(maxX + margin, Math.max(...cornerPts.map((p) => p[0])));
minY = Math.max(minY - margin, Math.min(...cornerPts.map((p) => p[1])));
maxY = Math.min(maxY + margin, Math.max(...cornerPts.map((p) => p[1])));
const W = Math.round(maxX - minX), H = Math.round(maxY - minY);
const Tc = [1, 0, -minX, 0, 1, -minY, 0, 0, 1];
const M = M0.map((m) => mul(Tc, m)); // shot px -> canvas px
const Minv = M.map(inv);
console.log(`canvas ${W}x${H}`);

// ---------- low-res pass: coverage, exposure, seams ----------
const lw = Math.round(W * LOW), lh = Math.round(H * LOW);
const low = imgs.map((im, i) => {
  const rgb = new Float32Array(lw * lh * 3);
  const ok = new Uint8Array(lw * lh);
  for (let y = 0; y < lh; y++)
    for (let x = 0; x < lw; x++) {
      const [u, v] = ap(Minv[i], [(x + 0.5) / LOW, (y + 0.5) / LOW]);
      // keep a small border off each shot's edge
      if (u < 8 || v < 8 || u >= im.w - 8 || v >= im.h - 8) continue;
      const s = (Math.floor(v) * im.w + Math.floor(u)) * 3;
      const o = y * lw + x;
      ok[o] = 1;
      rgb[o * 3] = im.rgb[s]; rgb[o * 3 + 1] = im.rgb[s + 1]; rgb[o * 3 + 2] = im.rgb[s + 2];
    }
  return { rgb, ok };
});

// Exposure: per-channel gain of each shot relative to its neighbour toward the reference.
const gain = imgs.map(() => [1, 1, 1]);
const pairGain = (a, b) => {
  const sa = [0, 0, 0], sb = [0, 0, 0];
  for (let o = 0; o < lw * lh; o++)
    if (low[a].ok[o] && low[b].ok[o]) for (let c = 0; c < 3; c++) { sa[c] += low[a].rgb[o * 3 + c]; sb[c] += low[b].rgb[o * 3 + c]; }
  return sa.map((v, c) => (v > 0 ? sb[c] / v : 1));
};
for (let i = ref - 1; i >= 0; i--) gain[i] = pairGain(i, i + 1).map((g, c) => g * gain[i + 1][c]);
for (let i = ref + 1; i < imgs.length; i++) gain[i] = pairGain(i, i - 1).map((g, c) => g * gain[i - 1][c]);
imgs.forEach((im, i) => console.log(`${im.id} gain: ${gain[i].map((g) => g.toFixed(3)).join(', ')}`));

// Seam between shot i and i+1: one x per low-res row, minimum-difference path through the overlap.
const seams = [];
for (let i = 0; i < imgs.length - 1; i++) {
  const A = low[i], B = low[i + 1];
  const BIG = 1e7;
  const cost = new Float32Array(lw * lh);
  for (let y = 0; y < lh; y++) {
    let x0 = -1, x1 = -1;
    for (let x = 0; x < lw; x++) if (A.ok[y * lw + x] && B.ok[y * lw + x]) { if (x0 < 0) x0 = x; x1 = x; }
    const mid = (x0 + x1) / 2, span = Math.max(1, x1 - x0);
    for (let x = 0; x < lw; x++) {
      const o = y * lw + x;
      if (!(A.ok[o] && B.ok[o])) { cost[o] = BIG; continue; }
      let d = 0;
      for (let c = 0; c < 3; c++) d += Math.abs(A.rgb[o * 3 + c] * gain[i][c] - B.rgb[o * 3 + c] * gain[i + 1][c]);
      cost[o] = d + 30 * ((x - mid) / span) ** 2; // mild pull toward the middle of the overlap
    }
  }
  // dynamic programming top -> bottom, moving at most one column per row
  const acc = new Float32Array(cost);
  const from = new Int16Array(lw * lh);
  for (let y = 1; y < lh; y++)
    for (let x = 0; x < lw; x++) {
      let best = acc[(y - 1) * lw + x], bx = x;
      if (x > 0 && acc[(y - 1) * lw + x - 1] < best) { best = acc[(y - 1) * lw + x - 1]; bx = x - 1; }
      if (x < lw - 1 && acc[(y - 1) * lw + x + 1] < best) { best = acc[(y - 1) * lw + x + 1]; bx = x + 1; }
      acc[y * lw + x] += best;
      from[y * lw + x] = bx;
    }
  let x = 0;
  for (let k = 1; k < lw; k++) if (acc[(lh - 1) * lw + k] < acc[(lh - 1) * lw + x]) x = k;
  const path = new Float32Array(lh);
  for (let y = lh - 1; y >= 0; y--) { path[y] = x; x = from[y * lw + x]; }
  seams.push(path);
}
const seamAt = (i, y) => {
  const p = seams[i];
  const fy = Math.min(lh - 1, Math.max(0, y * LOW));
  const y0 = Math.floor(fy), y1 = Math.min(lh - 1, y0 + 1);
  return ((p[y0] + (p[y1] - p[y0]) * (fy - y0)) + 0.5) / LOW;
};

// ---------- full-res composite ----------
const out = Buffer.alloc(W * H * 3);
const BG = [20, 17, 14];
function sample(i, x, y, px) {
  const im = imgs[i];
  const m = Minv[i];
  const w = m[6] * x + m[7] * y + m[8];
  const u = (m[0] * x + m[1] * y + m[2]) / w, v = (m[3] * x + m[4] * y + m[5]) / w;
  if (u < 0 || v < 0 || u > im.w - 2 || v > im.h - 2) return false;
  const x0 = u | 0, y0 = v | 0, fx = u - x0, fy = v - y0;
  const s = (y0 * im.w + x0) * 3, s2 = s + im.w * 3;
  for (let c = 0; c < 3; c++) {
    const top = im.rgb[s + c] + (im.rgb[s + 3 + c] - im.rgb[s + c]) * fx;
    const bot = im.rgb[s2 + c] + (im.rgb[s2 + 3 + c] - im.rgb[s2 + c]) * fx;
    px[c] = (top + (bot - top) * fy) * gain[i][c];
  }
  return true;
}
const pa = [0, 0, 0], pb = [0, 0, 0];
for (let y = 0; y < H; y++) {
  const sx = seams.map((_, i) => seamAt(i, y));
  for (let x = 0; x < W; x++) {
    // owner: the shot whose seams bracket x
    let owner = 0;
    while (owner < sx.length && x > sx[owner]) owner++;
    let r, g, b;
    // feather across the nearest seam
    const left = owner > 0 ? x - sx[owner - 1] : Infinity;
    const right = owner < sx.length ? sx[owner] - x : Infinity;
    const dist = Math.min(left, right);
    const okA = sample(owner, x, y, pa);
    if (dist < FEATHER && okA) {
      const other = left < right ? owner - 1 : owner + 1;
      const okB = sample(other, x, y, pb);
      const t = okB ? 0.5 + (0.5 * dist) / FEATHER : 1; // weight of the owner
      r = pa[0] * t + pb[0] * (1 - t); g = pa[1] * t + pb[1] * (1 - t); b = pa[2] * t + pb[2] * (1 - t);
    } else if (okA) {
      [r, g, b] = pa;
    } else {
      // owner doesn't cover this pixel: fall back to any shot that does
      let found = false;
      for (let k = 0; k < imgs.length && !found; k++) if (k !== owner && sample(k, x, y, pa)) { [r, g, b] = pa; found = true; }
      if (!found) [r, g, b] = BG;
    }
    const o = (y * W + x) * 3;
    out[o] = r > 255 ? 255 : r; out[o + 1] = g > 255 ? 255 : g; out[o + 2] = b > 255 ? 255 : b;
  }
}
// Fill any corner the shots don't reach by extending the nearest covered pixel in the same column.
{
  const covered = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) covered[p] = out[p * 3] === BG[0] && out[p * 3 + 1] === BG[1] && out[p * 3 + 2] === BG[2] ? 0 : 1;
  const above = new Int32Array(H);
  let filled = 0;
  for (let x = 0; x < W; x++) {
    let last = -1;
    for (let y = 0; y < H; y++) {
      if (covered[y * W + x]) last = y;
      above[y] = last;
    }
    let next = -1;
    for (let y = H - 1; y >= 0; y--) {
      if (covered[y * W + x]) {
        next = y;
        continue;
      }
      const a = above[y];
      const src = a < 0 ? next : next < 0 ? a : y - a <= next - y ? a : next;
      if (src < 0) continue;
      const s = (src * W + x) * 3, o = (y * W + x) * 3;
      out[o] = out[s]; out[o + 1] = out[s + 1]; out[o + 2] = out[s + 2];
      filled++;
    }
  }
  if (filled) console.log(`filled ${filled} uncovered px (${((filled / (W * H)) * 100).toFixed(2)}%)`);
}
await sharp(out, { raw: { width: W, height: H, channels: 3 } }).jpeg({ quality: 92, mozjpeg: true }).toFile(`source/${name}.jpg`);
console.log(`wrote source/${name}.jpg`);

// ---------- outlines -> stitched geometry ----------
if (withOutlines) {
  const ownerAt = (x, y) => {
    let o = 0;
    while (o < seams.length && x > seamAt(o, y)) o++;
    return o;
  };
  const area = (p) => Math.abs(p.reduce((s, [x, y], k) => { const [x2, y2] = p[(k + 1) % p.length]; return s + x * y2 - x2 * y; }, 0)) / 2;
  const best = new Map();
  imgs.forEach((im, i) =>
    outlines[i].forEach((h) => {
      const px = h.points.map(([x, y]) => ap(M[i], [x * im.w, y * im.h]));
      const c = [px.reduce((s, p) => s + p[0], 0) / px.length, px.reduce((s, p) => s + p[1], 0) / px.length];
      // Prefer the shot that is actually shown there, then the more complete (larger) tracing.
      const score = (ownerAt(c[0], c[1]) === i ? 1e12 : 0) + area(px);
      if (score > (best.get(h.frame)?.score ?? -1)) best.set(h.frame, { score, px, x: c[0] });
    }),
  );
  const hotspots = [...best.entries()]
    .sort((a, b) => a[1].x - b[1].x)
    .map(([frame, { px }]) => ({ frame, points: px.map(([x, y]) => [clamp01(x / W), clamp01(y / H)]) }));
  await mkdir('src/data/geometry', { recursive: true });
  await writeFile(`src/data/geometry/${name}.json`, JSON.stringify({ section: name, hotspots }, null, 1) + '\n');
  console.log(`wrote src/data/geometry/${name}.json (${hotspots.length} frames)`);
}

function median(a) {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}
function clamp01(v) {
  return +Math.min(1, Math.max(0, v)).toFixed(4);
}
