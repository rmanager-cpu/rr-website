// Dev check: draws a section's hotspot polygons onto its photo so alignment can be eyeballed.
//   node scripts/overlay.mjs <sectionId> <outFile>
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const [section, out] = process.argv.slice(2);
const geo = JSON.parse(await readFile(`src/data/geometry/${section}.json`, 'utf8'));
const base = sharp(`source/${section}.jpg`).rotate();
const W = 2000;
const meta = await base.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
const H = Math.round((meta.height / meta.width) * W);
const shapes = geo.hotspots.map((h) => {
  const pts = h.points.map(([x, y]) => `${x * W},${y * H}`).join(' ');
  const cx = (h.points.reduce((s, p) => s + p[0], 0) / h.points.length) * W;
  const cy = (h.points.reduce((s, p) => s + p[1], 0) / h.points.length) * H;
  return `<polygon points="${pts}" fill="rgba(255,255,0,0.12)" stroke="yellow" stroke-width="3"/>` +
    `<text x="${cx}" y="${cy}" font-size="34" fill="yellow" stroke="black" stroke-width="1.2" font-family="Arial" font-weight="bold" text-anchor="middle">${h.frame}</text>`;
});
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${shapes.join('')}</svg>`);
await base.clone().resize({ width: W, height: H, fit: 'fill' }).composite([{ input: svg }]).jpeg({ quality: 78 }).toFile(out);
console.log('wrote', out);
