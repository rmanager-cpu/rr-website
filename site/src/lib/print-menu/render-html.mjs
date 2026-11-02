// Menu data (JSON) + theme -> one self-contained HTML document, one <section> per printed page.
// Layout only. Fitting to the page happens in fit.js once the browser has measured everything.
import { fontFaceCss } from './fonts.mjs';

export const SIZES = {
  letter: { w: '8.5in', h: '11in', z: 1, cls: 'size-letter' },
  // corner: depth of the menu-book corner pockets (in). Text may not sit under them.
  'half-letter': { w: '5.5in', h: '8.5in', z: 1, cls: 'size-half', corner: 1.2 },
};

// Fallbacks only. Every menu can set its own marks, legend text and notices in its data file.
export const DEFAULT_MARKS = { gf: '*', raw: '^' };

// The sage green from the current Canva breakfast/lunch menus. Set "accent" on a menu to override
// (e.g. "#111" for an all-black menu).
export const ACCENT = '#738f7b';

export const DEFAULT_NOTICES = {
  consumer:
    'Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions.',
};

// legend entries may be "text" or { "mark": "*", "text": "…" }
const legendEntry = (menu, key) => {
  const v = menu.legend?.[key];
  if (v == null) return null;
  return typeof v === 'string' ? { mark: DEFAULT_MARKS[key] ?? '', text: v } : { mark: v.mark ?? DEFAULT_MARKS[key] ?? '', text: v.text ?? '' };
};
const markFor = (menu, key) => legendEntry(menu, key)?.mark ?? DEFAULT_MARKS[key] ?? '';

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function markers(tags = [], menu) {
  const m = tags.map((t) => markFor(menu, t)).filter(Boolean).join('');
  return m ? `<span class="mk">${esc(m)}</span>` : '';
}

function priceList(prices) {
  return prices
    .map((p) => `<span class="pl"><span class="pl-label">${esc(p.label)}</span> <span class="pl-price">${esc(p.price)}</span></span>`)
    .join('<span class="sep">&nbsp;· </span>');
}

function optionList(options) {
  return options
    .map((o) => `<span class="op"><span class="op-name">${esc(o.name)}</span> <span class="op-price">${esc(o.price)}</span></span>`)
    .join('<span class="sep">&nbsp;· </span>');
}

function standardItem(it, menu) {
  const price = it.price ? esc(it.price) : '';
  return `<div class="item">
  <div class="ihead"><span class="iname">${esc(it.name)}${markers(it.tags, menu)}</span><span class="lead"></span><span class="iprice">${price}</span></div>
  ${it.description ? `<div class="idesc">${esc(it.description)}</div>` : ''}
  ${it.note ? `<div class="inote">${esc(it.note)}</div>` : ''}
  ${it.prices ? `<div class="iprices">${priceList(it.prices)}</div>` : ''}
  ${it.options ? `<div class="iopts">${optionList(it.options)}</div>` : ''}
  ${price ? `<div class="iprice-below">${price}</div>` : ''}
</div>`;
}

function compactItem(it, menu) {
  return `<div class="item compact">
  <div class="ihead"><span class="iname">${esc(it.name)}${markers(it.tags, menu)}${
    it.description ? ` <span class="idesc-inline">${esc(it.description)}</span>` : ''
  }</span><span class="lead"></span><span class="iprice">${esc(it.price ?? '')}</span></div>
</div>`;
}

function inlineGroups(sec) {
  const groups = sec.groups ?? [{ items: (sec.items ?? []).map((i) => i.name) }];
  return groups
    .map(
      (g) => `<div class="item inline-group"><span class="ilist">${g.items
        .map((n) => `<span class="il">${esc(n)}</span>`)
        .join('<span class="sep">&nbsp;· </span>')}</span>${g.price ? ` <span class="iprice">${esc(g.price)}</span>` : ''}</div>`
    )
    .join('\n');
}

function section(sec, menu) {
  const style = sec.style ?? 'standard';
  // heading: "large" makes a section title the same size as a page title (e.g. Whiskey Cocktails = Behind the Bar).
  const big = sec.heading === 'large';
  const titleHtml = !sec.title ? ''
    : big ? `<div class="ph sec-ph"><h1 class="ptitle">${esc(sec.title)}</h1></div>`
    : `<h2 class="stitle"><span>${esc(sec.title)}</span></h2>`;
  const head = sec.title || sec.price || sec.note
    ? `${titleHtml}
       ${sec.price ? `<div class="sprice">${esc(sec.price)}</div>` : ''}
       ${sec.note ? `<div class="snote">${esc(sec.note)}</div>` : ''}`
    : '';

  let items;
  if (style === 'inline') items = [inlineGroups(sec)];
  else items = (sec.items ?? []).map((it) => (style === 'compact' || style === 'list' ? compactItem : standardItem)(it, menu));

  const cls = `sec style-${style}${sec.title ? '' : ' untitled'}${sec.newColumn ? ' new-col' : ''}`;

  // Two-up section: heading across the full width, items in a grid read across in pairs.
  // An odd last item centers underneath.
  if (sec.columns === 2 && style !== 'inline') {
    return `<div class="${cls} grid-sec">
  ${head ? `<div class="shead">${head}</div>` : ''}
  <div class="sec-grid">${items.join('\n')}</div>
</div>`;
  }

  // Keep a section title glued to its first item so a column never ends on a bare heading.
  const first = items.shift() ?? '';
  return `<div class="${cls}">
  <div class="keep">${head}${first}</div>
  ${items.join('\n')}
</div>`;
}

function footer(menu, page) {
  const keys = page.footer ?? [];
  const lines = keys
    .map((k) => {
      const leg = legendEntry(menu, k);
      if (leg) return `<p class="fl"><span class="mk">${esc(leg.mark)}</span> ${esc(leg.text)}</p>`;
      const notice = menu.notices?.[k] ?? DEFAULT_NOTICES[k];
      return notice ? `<p class="fl ${esc(k)}">${esc(notice)}</p>` : '';
    })
    .join('');
  return lines ? `<footer class="pf">${lines}</footer>` : '';
}

export function renderHtml(menu, theme) {
  const size = SIZES[menu.size];
  if (!size) throw new Error(`Unknown size "${menu.size}" (use letter or half-letter)`);

  const pages = menu.pages
    .map((page, i) => {
      const cols = page.columns ?? 1;
      const label = `${menu.name} p${i + 1}${page.title ? ` (${page.title})` : ''}`;
      return `<section class="page ${size.cls} cols-${cols}" data-label="${esc(label)}" data-corner-in="${size.corner ?? 0}"${page.minTypePt ? ` data-min-type-pt="${page.minTypePt}"` : ''}>
  <div class="frame">
    ${page.title || menu.brand ? `<header class="ph">
      ${menu.brand && i === 0 ? `<div class="brand">${esc(menu.brand)}</div>` : ''}
      ${page.title ? `<h1 class="ptitle">${esc(page.title)}</h1>` : ''}
      ${page.subtitle ? `<div class="snote">${esc(page.subtitle)}</div>` : ''}
    </header>` : ''}
    <div class="content"><div class="flow">
      ${page.sections.map((sec) => section(sec, menu)).join('\n')}
    </div></div>
    ${footer(menu, page)}
  </div>
</section>`;
    })
    .join('\n');

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(menu.name)}</title>
<style>
${fontFaceCss(theme.faces)}
@page { size: ${size.w} ${size.h}; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; }
* { box-sizing: border-box; }
.page { width: ${size.w}; height: ${size.h}; position: relative; overflow: hidden; break-after: page;
  --s: 1; --g: 1; --z: ${size.z}; --accent: ${menu.accent ?? ACCENT}; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page:last-child { break-after: auto; }
.size-letter { --pad: 0.55in; }
.size-half { --pad: 0.45in 0.5in; } /* corner pockets are enforced by the fitter, not the margin */
.frame { position: absolute; inset: 0; padding: var(--pad); display: flex; flex-direction: column; }
.content { flex: 1 1 auto; min-height: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
.cols-2 .flow { column-count: 2; column-fill: balance; max-height: 100%;
  column-gap: calc(0.22in + var(--g) * var(--z) * 0.22in); }
.item, .keep, .shead { break-inside: avoid; }
.cols-2 .sec { break-inside: avoid; }
.new-col { break-before: column; }
/* With a forced column break, fill straight down instead of balancing (balancing would push sections past the break). */
.cols-2 .flow:has(.new-col) { column-fill: auto; height: 100%; }
.sec-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: calc(0.18in + var(--g) * var(--z) * 0.12in); }
.sec-grid > .item:last-child:nth-child(odd) { grid-column: 1 / -1; justify-self: center; min-width: 50%; }
.shead + .sec-grid > .item:nth-child(-n+2) { margin-top: calc(var(--g) * var(--s) * var(--z) * 6pt); }
.ihead { display: flex; align-items: baseline; gap: 0.4em; }
.lead { flex: 1 1 auto; }
.sep { white-space: normal; }
.il, .pl, .op { white-space: nowrap; }
h1, h2, p { margin: 0; font-weight: inherit; }
${theme.css}
</style></head>
<body>
${pages}
</body></html>`;
}
