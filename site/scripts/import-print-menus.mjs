// Folds the Menu Maker's data files into seed-menus.json, so one set of menus drives the website and the
// printed PDFs. Run once per import:
//
//   node scripts/import-print-menus.mjs <folder with dinner.json, lunch.json, ...>
//
// Print settings land on the menu, section and item as `print`. Menus not listed here are untouched.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir) throw new Error('usage: node scripts/import-print-menus.mjs <data folder>');

// Maker file -> the website menu it replaces. `new` adds a menu; print-only menus start hidden.
const IMPORTS = [
  { file: 'dinner', slug: 'dinner' },
  { file: 'lunch', slug: 'weekend-lunch' },
  { file: 'breakfast', slug: 'weekend-breakfast' },
  { file: 'happy-hour', slug: 'happy-hour' },
  { file: 'bar', slug: 'bar', new: { name: 'Bar', sort: 20, active: false } },
  { file: 'holiday', slug: 'holiday-template', new: { name: 'Your Heading Here', intro: 'Your subheading here', sort: 30, active: false, kind: 'holiday' } },
  { file: 'banquet', slug: 'banquet-template', new: { name: 'Your Heading Here', intro: 'Your subheading here', sort: 40, active: false, kind: 'banquet' } },
];

const seedPath = 'src/content/seed-menus.json';
const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'dish';
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const byName = new Map(seed.dishes.map((d) => [norm(d.name), d]));
const taken = new Set(seed.dishes.map((d) => d.slug));
// The Maker's menus are the current ones, so its dish names and gluten-free marks replace Popmenu's.
const touched = new Set();
const markedGf = new Set();

function dishFor(item) {
  let d = byName.get(norm(item.name));
  if (d) d.name = item.name;
  if (!d) {
    let slug = slugify(item.name);
    for (let n = 2; taken.has(slug); n++) slug = `${slugify(item.name)}-${n}`;
    taken.add(slug);
    d = { slug, name: item.name, description: null, tags: [], raw: false };
    seed.dishes.push(d);
    byName.set(norm(item.name), d);
  }
  return d;
}

// "18" and "12/17" are numbers; anything else ("Market Price", "00") is kept as written.
const PLAIN = /^\d+(\.\d+)?(\/\d+(\.\d+)?)*$/;
function pricesOf(item) {
  if (item.prices) return { prices: item.prices.map((p) => ({ label: p.label ?? null, price: Number(p.price) })), price_note: null };
  if (!item.price) return { prices: [], price_note: null };
  if (PLAIN.test(item.price)) return { prices: item.price.split('/').map((p) => ({ label: null, price: Number(p) })), price_note: null };
  return { prices: [], price_note: item.price };
}

function toItem(item, tags) {
  const d = dishFor(item);
  // Tags live on the shared dish; a dish marked on any menu keeps its mark.
  touched.add(d);
  if (tags.includes('gf')) markedGf.add(d);
  if (tags.includes('raw')) d.raw = true;
  const print = {};
  if (item.note) print.note = item.note;
  if (item.options) print.options = item.options;
  if (!tags.includes('gf')) print.noGf = true; // the same dish can be gluten free on one menu and not another
  return {
    dish: d.slug,
    ...pricesOf(item),
    description: item.description ?? '', // '' keeps a shared dish description off this menu
    ...(Object.keys(print).length ? { print } : {}),
  };
}

function toSection(sec, page, pageIndex, sectionIndex) {
  const items = sec.groups
    ? sec.groups.flatMap((g) => g.items.map((name) => toItem({ name, price: g.price }, [])))
    : (sec.items ?? []).map((i) => toItem(i, i.tags ?? []));
  const print = { page: pageIndex };
  for (const k of ['style', 'columns', 'newColumn', 'heading', 'price']) if (sec[k] !== undefined) print[k] = sec[k];
  if (!sec.title) print.hideTitle = true;
  return { name: sec.title || page.title || `Section ${sectionIndex + 1}`, note: sec.note ?? null, items, print };
}

for (const imp of IMPORTS) {
  const src = JSON.parse(readFileSync(path.join(dir, `${imp.file}.json`), 'utf8'));
  const print = {
    theme: src.theme ?? 'classic',
    size: src.size,
    ...(src.accent ? { accent: src.accent } : {}),
    ...(src.brand ? { brand: src.brand } : {}),
    ...(src.minTypePt ? { minTypePt: src.minTypePt } : {}),
    legend: src.legend ?? {},
    ...(src.notices ? { notices: src.notices } : {}),
    pages: src.pages.map(({ title, subtitle, columns, footer, minTypePt }) => {
      const page = {};
      // Templates take their heading and subheading from the menu's name and intro.
      if (!imp.new?.kind) { if (title) page.title = title; if (subtitle) page.subtitle = subtitle; }
      if (columns) page.columns = columns;
      if (footer) page.footer = footer;
      if (minTypePt) page.minTypePt = minTypePt;
      return page;
    }),
  };
  const sections = src.pages.flatMap((p, pi) => p.sections.map((s, si) => toSection(s, p, pi, si)));
  const existing = seed.menus.find((m) => m.slug === imp.slug);
  if (existing) {
    existing.sections = sections;
    existing.print = print;
  } else {
    seed.menus.push({ slug: imp.slug, name: imp.new.name, sort: imp.new.sort, intro: imp.new.intro ?? null, hours: [], serving_note: null, footer: null, active: imp.new.active, kind: imp.new.kind ?? 'regular', sections, print });
  }
}

for (const d of touched) {
  d.tags = d.tags.filter((t) => t !== 'GF');
  if (markedGf.has(d)) d.tags.push('GF');
}
// noGf only matters for a dish marked gluten free somewhere else.
const slugsMarked = new Set([...markedGf].map((d) => d.slug));
for (const m of seed.menus) for (const s of m.sections) for (const it of s.items) {
  if (!it.print?.noGf || slugsMarked.has(it.dish)) continue;
  delete it.print.noGf;
  if (!Object.keys(it.print).length) delete it.print;
}

writeFileSync(seedPath, JSON.stringify(seed, null, 1) + '\n');
console.log(`seed now has ${seed.menus.length} menus, ${seed.dishes.length} dishes`);
