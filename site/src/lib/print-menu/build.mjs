// Menu data + theme -> print-ready PDF. Every page is fitted in a real browser; a page that can't fit
// at the minimum type size returns no PDF and says how many items to cut.
import { readdirSync, readFileSync, rmSync, statfsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, rgb, degrees } from 'pdf-lib';
import { renderHtml, SIZES } from './render-html.mjs';
import { getTheme, THEMES } from './themes.mjs';

export const THEME_IDS = Object.keys(THEMES);

const WINDOWS_CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

// On Vercel a warm server keeps its /tmp (512 MB) between prints, and serves several requests at once.
// Chromium unpacks itself into /tmp on first use, and every launch leaves a profile and caches there.
// Two prints at once (the preview frame plus "Open PDF") could launch a half-unpacked browser, and the
// leftovers filled /tmp until every print failed ("ENOSPC: no space left on device"). So: one print at
// a time per server, and each one starts by clearing what earlier prints left behind.
let queue = Promise.resolve();

/** What earlier prints leave in /tmp. Chromium's own unpacked files (chromium, al2023, fonts, the
 * swiftshader libraries) don't match, so they're kept and never unpacked twice. */
export const LEFTOVER = /^(playwright|\.org\.chromium\.|\.com\.google\.Chrome|core\.|\.cache$|\.config$|\.local$|\.pki$|\.fontconfig$)/;

export function clearLeftovers(dir = os.tmpdir()) {
  for (const name of readdirSync(dir)) if (LEFTOVER.test(name)) rmSync(path.join(dir, name), { recursive: true, force: true });
}

const freeMb = (dir) => {
  try {
    const s = statfsSync(dir);
    return Math.round((s.bavail * s.bsize) / 1048576);
  } catch {
    return null;
  }
};

async function launch() {
  if (process.env.VERCEL) {
    const tmp = os.tmpdir();
    clearLeftovers(tmp);
    const free = freeMb(tmp);
    if (free !== null && free < 200) console.warn(`[print] /tmp has ${free} MB free after clearing leftovers: ${readdirSync(tmp).join(', ')}`);
    const { default: sparticuz } = await import('@sparticuz/chromium');
    return chromium.launch({ executablePath: await sparticuz.executablePath(), args: sparticuz.args, headless: true });
  }
  return chromium.launch({ executablePath: process.env.CHROME_PATH || (process.platform === 'win32' ? WINDOWS_CHROME : '/usr/bin/google-chrome') });
}

/** Runs one job with its own browser page. Jobs wait their turn: one browser at a time on a server. */
function queued(job) {
  const run = queue.then(async () => {
    const browser = await launch();
    try {
      const page = await browser.newPage();
      // Fonts and the logo are inside the page itself. Nothing is ever fetched from anywhere.
      await page.route('**/*', (route) => route.abort());
      return await job(page);
    } finally {
      await browser.close();
    }
  });
  queue = run.catch(() => {}); // a failed print never blocks the next one
  return run;
}

/**
 * Build one menu in one theme. Returns { ok, report, floorPt, theme, widened, pdf?, printPdf?, printCopiesPdf? }.
 *   widened: page numbers that were set in two columns so the menu fits ([] if it fit as laid out).
 *   opts.meta: { title, author, subject, keywords[] } for the PDF's document properties.
 */
export function buildMenu(menu, themeId, opts = {}) {
  return queued((page) => buildOne(page, menu, getTheme(themeId), opts));
}

/**
 * Build the menu in the first of these styles it fits in (one browser for all the tries). Returns the
 * winning style's result, or the first style's if none fit.
 *   opts.split: how far it may spread pages that run over (guest copies only: a download can run to more
 *   pages, a printed menu keeps the pages staff set). Try n spreads each such page over n + 1 pages, cut
 *   evenly at section breaks, and tries every style again; so it settles on the fewest pages that fit.
 *   result.pages = page count.
 */
export function buildFirstFit(menu, themeIds, opts = {}) {
  return queued(async (page) => {
    let layout = menu;
    let asLaidOut;
    for (let n = 0; n <= (opts.split ?? 0); n++) {
      let first;
      for (const id of themeIds) {
        const r = await buildOne(page, layout, getTheme(id), opts);
        if (r.ok) return { ...r, pages: layout.pages.length };
        first ??= r;
      }
      asLaidOut ??= first;
      const next = spreadOverflowing(menu, asLaidOut.report, n + 2);
      if (!next) break;
      layout = next;
    }
    return { ...asLaidOut, pages: menu.pages.length };
  });
}

/** Each page that ran over (as staff laid it out), spread over `parts` pages cut at the section breaks
 * that share its items most evenly. The title stays on the first, the fine print goes on the last.
 * null if no page that ran over can be cut that many ways. */
export function spreadOverflowing(menu, report, parts) {
  let changed = false;
  const pages = menu.pages.flatMap((p, i) => {
    const secs = p.sections ?? [];
    if (report[i]?.fits !== false || secs.length < parts) return [p];
    const weight = secs.map((s) => Math.max(1, (s.items ?? s.groups ?? []).length));
    const sums = weight.reduce((acc, w) => [...acc, acc[acc.length - 1] + w], [0]);
    const total = sums[sums.length - 1];
    const cuts = [];
    for (let j = 1; j < parts; j++) {
      // the break nearest j/parts of the way through, leaving at least one section for each later page
      let best = (cuts[cuts.length - 1] ?? 0) + 1;
      for (let k = best; k <= secs.length - (parts - j); k++) {
        if (Math.abs(sums[k] - (total * j) / parts) < Math.abs(sums[best] - (total * j) / parts)) best = k;
      }
      cuts.push(best);
    }
    changed = true;
    const { footer, title, subtitle, ...rest } = p;
    const bounds = [0, ...cuts, secs.length];
    return cuts.concat(secs.length).map((end, j) => ({
      ...rest,
      ...(j === 0 && title ? { title } : {}),
      ...(j === 0 && subtitle ? { subtitle } : {}),
      ...(j === parts - 1 && footer ? { footer } : {}),
      sections: secs.slice(bounds[j], end),
    }));
  });
  return changed ? { ...menu, pages } : null;
}

/** Which styles a menu fits in, the same way buildMenu would lay it out. No PDF is made.
 * Returns { [themeId]: { ok, widened } }. */
export function checkThemes(menu, themeIds = THEME_IDS) {
  return queued(async (page) => {
    const out = {};
    for (const id of themeIds) {
      const r = await fitLayout(page, menu, getTheme(id));
      out[id] = { ok: r.ok, widened: r.widened };
    }
    return out;
  });
}

async function buildOne(page, menu, theme, opts) {
  const fit = await fitLayout(page, menu, theme);
  const result = { ok: fit.ok, report: fit.report, floorPt: fit.floorPt, theme: theme.id, widened: fit.widened };
  if (!fit.ok) return result; // never hand back a page that doesn't fit
  const raw = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  const meta = opts.meta ?? { title: menu.name };
  result.pdf = await stampMeta(raw, meta);
  if (menu.size === 'half-letter') {
    result.printPdf = await stampMeta(await imposeTwoUp(raw, 'pairs'), meta);
    result.printCopiesPdf = await stampMeta(await imposeTwoUp(raw, 'copies'), meta);
  }
  return result;
}

async function measure(page, menu, theme) {
  const size = SIZES[menu.size];
  if (!size) throw new Error(`Unknown size "${menu.size}" (use letter, legal or half-letter)`);
  const floorPt = menu.minTypePt ?? theme.floorPt[menu.size]; // a menu can set its own minimum
  const sMin = floorPt / (theme.bodyPt * size.z);
  await page.setContent(renderHtml(menu, theme), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.addScriptTag({ content: readFileSync(path.join(process.cwd(), 'src/lib/print-menu/fit.js'), 'utf8') });
  const report = await page.evaluate((cfg) => window.__fitMenu(cfg), { sMin, basePt: theme.bodyPt * size.z });
  return { report, floorPt };
}

/**
 * Lays the menu out as staff set it. If a one-column page runs over, it tries that page in two columns
 * before giving up. Leaves the browser page showing the layout it settled on, ready to print.
 */
async function fitLayout(page, menu, theme) {
  const first = await measure(page, menu, theme);
  if (first.report.every((p) => p.fits)) return { ok: true, report: first.report, floorPt: first.floorPt, widened: [] };
  const widen = menu.pages.map((p, i) => Boolean(first.report[i] && !first.report[i].fits && first.report[i].reason !== 'corner' && (p.columns ?? 1) === 1));
  if (!widen.some(Boolean)) return { ok: false, report: first.report, floorPt: first.floorPt, widened: [] };
  const twoCol = { ...menu, pages: menu.pages.map((p, i) => (widen[i] ? { ...p, columns: 2 } : p)) };
  const second = await measure(page, twoCol, theme);
  if (second.report.every((p) => p.fits)) {
    return { ok: true, report: second.report, floorPt: second.floorPt, widened: widen.flatMap((w, i) => (w ? [i + 1] : [])) };
  }
  return { ok: false, report: first.report, floorPt: first.floorPt, widened: [] }; // say how far over it is as laid out
}

/** Document properties (title, author, subject, keywords). Changes nothing on the pages. */
export async function stampMeta(bytes, meta) {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  doc.setTitle(meta.title, { showInWindowTitleBar: true });
  if (meta.author) doc.setAuthor(meta.author);
  if (meta.subject) doc.setSubject(meta.subject);
  if (meta.keywords?.length) doc.setKeywords(meta.keywords);
  doc.setCreator('River Ranch menu printer');
  doc.setProducer('River Ranch Lodge');
  const now = new Date();
  doc.setCreationDate(now);
  doc.setModificationDate(now);
  return doc.save();
}

/** The web links on a page: [{ uri, rect: [x1, y1, x2, y2] }] in the page's own coordinates. */
export function pageLinks(page) {
  const annots = page.node.Annots();
  if (!annots) return [];
  const links = [];
  for (let i = 0; i < annots.size(); i++) {
    const a = annots.lookup(i);
    if (!(a instanceof PDFDict) || a.get(PDFName.of('Subtype')) !== PDFName.of('Link')) continue;
    const action = a.lookup(PDFName.of('A'));
    if (!(action instanceof PDFDict) || action.get(PDFName.of('S')) !== PDFName.of('URI')) continue;
    const uri = action.lookup(PDFName.of('URI'));
    const rect = a.lookup(PDFName.of('Rect'));
    if (!uri?.decodeText || !(rect instanceof PDFArray)) continue;
    const [x1, y1, x2, y2] = rect.asArray().map((n) => n.asNumber());
    links.push({ uri: uri.decodeText(), rect: [Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)] });
  }
  return links;
}

/** A plain, borderless web link over rect. The address is written as hex so nothing in it needs escaping. */
function addLink(doc, page, rect, uri) {
  const annot = doc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: rect,
    Border: [0, 0, 0],
    F: 4, // print flag: the link exists on screen and paper alike (it's invisible either way)
    A: { Type: 'Action', S: 'URI', URI: PDFHexString.of(Buffer.from(uri, 'latin1').toString('hex')) },
  });
  page.node.addAnnot(doc.context.register(annot));
}

/**
 * The bar book's print sheet: regular 8.5x11 printer paper, portrait, two menu pages per sheet,
 * each turned sideways (top of the page toward the right edge of the sheet), cut across the middle.
 *   mode 'pairs':  page 1 on top, page 2 below; then 3 over 4 …   (one full set per run)
 *   mode 'copies': each page twice on its own sheet                (two sets per run)
 * Placing a page on a sheet keeps its picture but not its links, so each link is moved across too.
 */
export async function imposeTwoUp(pdfBytes, mode = 'pairs') {
  const src = await PDFDocument.load(pdfBytes);
  const out = await PDFDocument.create();
  const srcPages = src.getPages();
  const embedded = await out.embedPages(srcPages);
  const links = srcPages.map((p) => ({ box: p.getMediaBox(), links: pageLinks(p) }));
  const W = 612, H = 792, mid = H / 2, tick = 16; // portrait letter, in points
  const sheets = mode === 'copies'
    ? embedded.map((_, i) => [i, i])
    : embedded.flatMap((_, i) => (i % 2 ? [] : [[i, i + 1 < embedded.length ? i + 1 : null]]));
  // Rotating a 5.5x8.5 page 90° clockwise about its corner makes it 8.5 wide x 5.5 tall,
  // hanging down from the anchor point: anchor at the top of each half.
  // A point (px, py) on the page lands at (x + (py - bottom), y - (px - left)) on the sheet.
  const place = (sheet, i, x, y) => {
    sheet.drawPage(embedded[i], { x, y, rotate: degrees(-90) });
    const { box, links: ls } = links[i];
    for (const { uri, rect: [x1, y1, x2, y2] } of ls) {
      addLink(out, sheet, [x + (y1 - box.y), y - (x2 - box.x), x + (y2 - box.y), y - (x1 - box.x)], uri);
    }
  };
  for (const [top, bottom] of sheets) {
    const sheet = out.addPage([W, H]);
    place(sheet, top, 0, H);
    if (bottom !== null) place(sheet, bottom, 0, mid);
    const mark = { thickness: 0.6, color: rgb(0.35, 0.35, 0.35) };
    sheet.drawLine({ start: { x: 0, y: mid }, end: { x: tick, y: mid }, ...mark });
    sheet.drawLine({ start: { x: W, y: mid }, end: { x: W - tick, y: mid }, ...mark });
  }
  return out.save();
}
