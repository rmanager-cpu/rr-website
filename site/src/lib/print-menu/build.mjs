// Menu data + theme -> print-ready PDF. Every page is fitted in a real browser; a page that can't fit
// at the minimum type size returns no PDF and says how many items to cut.
import { readdirSync, readFileSync, rmSync, statfsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
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

/** Build one menu in one theme. Returns { ok, report, floorPt, pdf?, printPdf?, printCopiesPdf? }.
 * Prints wait their turn: only one browser runs at a time on a server. */
export function buildMenu(menu, themeId) {
  const run = queue.then(() => buildMenuNow(menu, themeId));
  queue = run.catch(() => {}); // a failed print never blocks the next one
  return run;
}

async function buildMenuNow(menu, themeId) {
  const theme = getTheme(themeId);
  const size = SIZES[menu.size];
  const floorPt = menu.minTypePt ?? theme.floorPt[menu.size]; // a menu can set its own minimum
  const sMin = floorPt / (theme.bodyPt * size.z);
  const fitJs = readFileSync(path.join(process.cwd(), 'src/lib/print-menu/fit.js'), 'utf8');

  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setContent(renderHtml(menu, theme), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: fitJs });
    const report = await page.evaluate((cfg) => window.__fitMenu(cfg), { sMin, basePt: theme.bodyPt * size.z });
    const ok = report.every((p) => p.fits);
    const result = { ok, report, floorPt, theme: theme.id };
    if (!ok) return result; // never hand back a page that doesn't fit
    result.pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    if (menu.size === 'half-letter') {
      result.printPdf = await imposeTwoUp(result.pdf, 'pairs');
      result.printCopiesPdf = await imposeTwoUp(result.pdf, 'copies');
    }
    return result;
  } finally {
    await browser.close();
  }
}

/**
 * The bar book's print sheet: regular 8.5x11 printer paper, portrait, two menu pages per sheet,
 * each turned sideways (top of the page toward the right edge of the sheet), cut across the middle.
 *   mode 'pairs':  page 1 on top, page 2 below; then 3 over 4 …   (one full set per run)
 *   mode 'copies': each page twice on its own sheet                (two sets per run)
 */
export async function imposeTwoUp(pdfBytes, mode = 'pairs') {
  const src = await PDFDocument.load(pdfBytes);
  const out = await PDFDocument.create();
  const embedded = await out.embedPages(src.getPages());
  const W = 612, H = 792, mid = H / 2, tick = 16; // portrait letter, in points
  const sheets = mode === 'copies'
    ? embedded.map((p) => [p, p])
    : embedded.flatMap((p, i) => (i % 2 ? [] : [[p, embedded[i + 1]]]));
  for (const [top, bottom] of sheets) {
    const sheet = out.addPage([W, H]);
    // Rotating a 5.5x8.5 page 90° clockwise about its corner makes it 8.5 wide x 5.5 tall,
    // hanging down from the anchor point: anchor at the top of each half.
    sheet.drawPage(top, { x: 0, y: H, rotate: degrees(-90) });
    if (bottom) sheet.drawPage(bottom, { x: 0, y: mid, rotate: degrees(-90) });
    const mark = { thickness: 0.6, color: rgb(0.35, 0.35, 0.35) };
    sheet.drawLine({ start: { x: 0, y: mid }, end: { x: tick, y: mid }, ...mark });
    sheet.drawLine({ start: { x: W, y: mid }, end: { x: W - tick, y: mid }, ...mark });
  }
  return out.save();
}
