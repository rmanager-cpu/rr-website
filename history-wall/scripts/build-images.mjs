// Builds the web versions of each wall section photo.
//   source/<id>.jpg  ->  public/wall/<id>-<width>.webp      (whole image at each width in WIDTHS)
//                    ->  public/wall/<id>/<col>_<row>.webp  (full-resolution tiles, when wider than the
//                                                          largest whole image; loaded only on zoom)
//                    ->  src/data/images.json                (sizes, tiles, a tiny blurred placeholder)
// Run after adding or replacing a photo in source/:  npm run images
// Pass --grid <outdir> to also write gridded copies (used to read frame corners off the photo).
import sharp from 'sharp';
import { readdir, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

const WIDTHS = [1200, 2400, 4096];
const TILE = 1024;
const SRC = 'source';
const OUT = 'public/wall';
const MANIFEST = 'src/data/images.json';

const gridArg = process.argv.indexOf('--grid');
const gridDir = gridArg > -1 ? process.argv[gridArg + 1] : null;

sharp.cache(false);
await mkdir(OUT, { recursive: true });
if (gridDir) await mkdir(gridDir, { recursive: true });

const manifest = {};

for (const entry of (await readdir(SRC, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
  if (!entry.isFile() || !/\.(jpe?g|png|webp|tiff?)$/i.test(entry.name)) continue;
  const file = entry.name;
  const id = path.parse(file).name;
  const full = await sharp(path.join(SRC, file), { limitInputPixels: false }).rotate().toBuffer({ resolveWithObject: true });
  const { width, height } = full.info;
  const base = () => sharp(full.data, { limitInputPixels: false });

  const files = [];
  for (const w of WIDTHS) {
    const target = Math.min(w, width);
    if (files.some((f) => f.w === target)) continue;
    const name = `${id}-${target}.webp`;
    await base().resize({ width: target }).webp({ quality: 82 }).toFile(`${OUT}/${name}`);
    files.push({ w: target, src: `wall/${name}` });
  }

  // Tiles at full resolution, overlapping by 1px so no hairline gaps show between them.
  let tiles;
  await rm(`${OUT}/${id}`, { recursive: true, force: true });
  if (width > files[files.length - 1].w) {
    await mkdir(`${OUT}/${id}`, { recursive: true });
    const cols = Math.ceil(width / TILE);
    const rows = Math.ceil(height / TILE);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const left = c * TILE;
        const top = r * TILE;
        await base()
          .extract({ left, top, width: Math.min(TILE + 1, width - left), height: Math.min(TILE + 1, height - top) })
          .webp({ quality: 80 })
          .toFile(`${OUT}/${id}/${c}_${r}.webp`);
      }
    tiles = { size: TILE, cols, rows, src: `wall/${id}/{col}_{row}.webp` };
  }

  const tiny = await base().resize({ width: 32 }).blur(1).webp({ quality: 50 }).toBuffer();
  manifest[id] = { width, height, files, ...(tiles ? { tiles } : {}), placeholder: `data:image/webp;base64,${tiny.toString('base64')}` };
  console.log(`${id}: ${width}x${height} -> ${files.map((f) => f.w).join(', ')}${tiles ? ` + ${tiles.cols * tiles.rows} tiles` : ''}`);

  if (gridDir) await writeGrid(base, id, width, height);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`wrote ${MANIFEST}`);

async function writeGrid(base, id, width, height) {
  const W = 2000;
  const H = Math.round((height / width) * W);
  const lines = [];
  for (let i = 0; i <= 100; i += 2.5) {
    const major = i % 10 === 0;
    const x = (i / 100) * W;
    const y = (i / 100) * H;
    const stroke = major ? 'rgba(255,0,255,0.9)' : 'rgba(0,255,255,0.55)';
    const sw = major ? 2 : 1;
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${stroke}" stroke-width="${sw}"/>`);
    lines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${stroke}" stroke-width="${sw}"/>`);
    if (major) {
      lines.push(`<text x="${x + 3}" y="22" font-size="20" fill="yellow" stroke="black" stroke-width="0.6" font-family="Arial" font-weight="bold">${i}</text>`);
      lines.push(`<text x="3" y="${y - 4}" font-size="20" fill="yellow" stroke="black" stroke-width="0.6" font-family="Arial" font-weight="bold">${i}</text>`);
    }
  }
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${lines.join('')}</svg>`);
  await base().resize({ width: W, height: H, fit: 'fill' }).composite([{ input: svg }]).jpeg({ quality: 80 }).toFile(path.join(gridDir, `${id}-grid.jpg`));
}
