// Four print themes. Every size is written through T() (type) or G() (spacing) so the
// fitter can shrink or grow the whole page with two numbers: --s (type) and --g (spacing).
//
// bodyPt  = size of the running text (descriptions / list items) at --s = 1 on a letter page.
// floorPt = the smallest that running text is ever allowed to get, per page size.
//           If a page can't fit at the floor, the build fails instead of printing it.

const T = (pt) => `calc(var(--s) * var(--z) * ${pt}pt)`;
const G = (pt) => `calc(var(--g) * var(--s) * var(--z) * ${pt}pt)`;

const FLOOR = { letter: 9, 'half-letter': 9 };

// Pieces every theme shares.
const common = `
/* style "list": short centered lines, "Basil Hayden 16" — the printed bar menu's spirits layout */
.style-list .item.compact { text-align: center; margin-top: ${G(1.5)}; }
.style-list .item.compact .ihead { display: block; }
/* the row's own (unstyled) font size would set a tall minimum line; zero it and let the text set the height */
.style-list .item.compact .ihead { line-height: 0 !important; }
.style-list .item.compact .ihead > * { line-height: 1.18 !important; }
.style-list .item.compact .lead { display: none !important; }
.style-list .item.compact .iprice { margin-left: .35em; }
.item.compact .ihead { line-height: 1.22; }
.sec-ph { margin-bottom: ${G(6)}; }
.sec:not(:first-child) > .keep > .sec-ph, .sec:not(:first-child) > .shead > .sec-ph { margin-top: ${G(16)}; }
.stitle > span { text-align: center; flex: 0 1 auto; }
.stitle::before, .stitle::after { min-width: .8em; }
.cols-2 .stitle { letter-spacing: .14em; }
.ph { text-align: center; margin-bottom: ${G(14)}; }
.sec { margin-top: ${G(14)}; }
.sec:first-child { margin-top: 0; }
.item { margin-top: ${G(9)}; }
.keep > .item:first-of-type { margin-top: ${G(6)}; }
.item.compact { margin-top: ${G(2.5)}; }
.style-compact .keep > .item:first-of-type { margin-top: ${G(5)}; }
.inline-group { margin-top: ${G(5)}; }
.pf { margin-top: ${G(12)}; padding-top: ${G(7)}; text-align: center; font-size: ${T(8.5)}; line-height: 1.35; }
.pf .fl + .fl { margin-top: ${G(2)}; }
.mk { margin-left: 0.15em; font-weight: 400; }
.idesc-inline { font-weight: 400; }
`;

// 1. Classic — closest to the current dinner menus: slab caps names, centered, price underneath.
const classic = {
  id: 'classic',
  label: 'Classic',
  bodyPt: 11,
  floorPt: FLOOR,
  faces: [
    ['Zilla Slab', 600], ['Zilla Slab', 700],
    ['Libre Baskerville', 400], ['Libre Baskerville', 400, 'italic'], ['Libre Baskerville', 700],
  ],
  css: `${common}
.page { font-family: 'Libre Baskerville', Georgia, serif; }
.brand { font: 600 ${T(10)} 'Zilla Slab', serif; letter-spacing: .32em; text-transform: uppercase; margin-bottom: ${G(4)}; }
.ptitle { font: 700 ${T(27)}/1.05 'Zilla Slab', serif; text-transform: uppercase; letter-spacing: .02em; }
.stitle { font: 700 ${T(15)}/1.1 'Zilla Slab', serif; text-transform: uppercase; letter-spacing: .04em;
  display: flex; align-items: center; gap: .6em; }
.stitle::before, .stitle::after { content: ''; flex: 1; border-top: 1.2px solid var(--accent); }
.ph::after { content: ''; display: block; width: 1.3in; margin: calc(5pt + ${G(6)}) auto 0; border-top: 2px solid var(--accent); }
.sprice { text-align: center; font: 600 ${T(13)} 'Zilla Slab', serif; margin-top: ${G(2)}; }
.snote { text-align: center; font: italic 400 ${T(10)} 'Libre Baskerville', serif; margin-top: ${G(3)}; }
.item { text-align: center; }
.item .ihead { justify-content: center; }
.item .lead, .item:not(.compact) .ihead .iprice { display: none; }
.iname { font: 700 ${T(13)}/1.2 'Zilla Slab', serif; text-transform: uppercase; letter-spacing: .03em; }
.idesc, .inote, .iprices, .iopts, .iprice-below { font-size: ${T(11)}; line-height: 1.38; margin-top: ${G(1.5)}; }
.inote { font-style: italic; }
.iopts .op-price, .iprices .pl-price { font-weight: 700; }
.iprice-below { font-weight: 700; }
.item.compact { text-align: left; }
.item.compact .lead { display: block; border-bottom: 1px dotted #777; transform: translateY(-.25em); }
.item.compact .iname { font: 400 ${T(11)}/1.3 'Libre Baskerville', serif; text-transform: none; letter-spacing: 0; }
.item.compact .idesc-inline { font-style: italic; color: #333; }
.item.compact .iprice { font: 700 ${T(11)} 'Libre Baskerville', serif; }
.inline-group { text-align: center; font-size: ${T(11)}; line-height: 1.45; }
.inline-group .iprice { font-weight: 700; margin-left: .3em; }
.pf { border-top: 1px solid var(--accent); font-style: italic; }
`,
};

// 2. Fireside — elegant serif, small-caps headings between hairlines, price beside the name.
const fireside = {
  id: 'fireside',
  label: 'Fireside',
  bodyPt: 12.5,
  floorPt: { letter: 10, 'half-letter': 10 }, // Cormorant runs small; its floor sits a point higher
  faces: [
    ['Cormorant Garamond', 500], ['Cormorant Garamond', 500, 'italic'],
    ['Cormorant Garamond', 600], ['Cormorant Garamond', 700],
  ],
  css: `${common}
.page { font-family: 'Cormorant Garamond', Garamond, serif; font-weight: 500; }
.brand { font: 600 ${T(11)} 'Cormorant Garamond', serif; letter-spacing: .4em; text-transform: uppercase; margin-bottom: ${G(2)}; }
.ptitle { font: 600 ${T(34)}/1 'Cormorant Garamond', serif; letter-spacing: .06em; }
.ph::after { content: ''; display: block; width: 1.1in; margin: ${G(9)} auto 0; border-top: 1.5px solid var(--accent); }
.stitle { font: 700 ${T(13.5)}/1.1 'Cormorant Garamond', serif; text-transform: uppercase; letter-spacing: .28em;
  display: flex; align-items: center; gap: .9em; }
.stitle::before, .stitle::after { content: ''; flex: 1; border-top: .9px solid var(--accent); }
.sprice { text-align: center; font: 600 ${T(15)} 'Cormorant Garamond', serif; margin-top: ${G(1)}; }
.snote { text-align: center; font: italic 500 ${T(12.5)} 'Cormorant Garamond', serif; margin-top: ${G(2)}; }
.item { text-align: center; }
.item:not(.compact) .ihead { justify-content: center; gap: .55em; }
.item:not(.compact) .lead { display: none; }
.iname { font: 700 ${T(15.5)}/1.15 'Cormorant Garamond', serif; letter-spacing: .02em; }
.iprice { font: 600 ${T(15.5)} 'Cormorant Garamond', serif; }
.idesc, .inote, .iprices, .iopts { font-size: ${T(12.5)}; line-height: 1.3; margin-top: ${G(1)}; }
.idesc { font-style: italic; }
.iprices .pl-price, .iopts .op-price { font-weight: 700; }
.iprice-below { display: none; }
.item.compact { text-align: left; }
.item.compact .lead { display: block; border-bottom: .75px dotted #888; transform: translateY(-.28em); }
.item.compact .iname { font: 600 ${T(12.5)}/1.25 'Cormorant Garamond', serif; letter-spacing: 0; }
.item.compact .idesc-inline { font-style: italic; font-weight: 500; }
.item.compact .iprice { font-size: ${T(12.5)}; font-weight: 700; }
.inline-group { text-align: center; font-size: ${T(12.5)}; line-height: 1.4; }
.inline-group .iprice { font-weight: 700; margin-left: .35em; }
.pf { font-style: italic; font-size: ${T(10)}; }
.pf::before { content: ''; display: block; width: 1.1in; margin: 0 auto ${G(6)}; border-top: 1px solid var(--accent); }
.pf { padding-top: 0; }
`,
};

// 3. Trailhead — clean modern sans, left-aligned, dotted leaders to prices. Easiest to scan.
const trailhead = {
  id: 'trailhead',
  label: 'Trailhead',
  bodyPt: 10.5,
  floorPt: FLOOR,
  faces: [
    ['Josefin Sans', 400], ['Josefin Sans', 600], ['Josefin Sans', 700],
    ['Inter', 400], ['Inter', 500], ['Inter', 600],
  ],
  css: `${common}
.page { font-family: 'Inter', Arial, sans-serif; }
.ph { text-align: left; border-bottom: 2.5px solid var(--accent); padding-bottom: ${G(7)}; }
.size-half .ph { text-align: center; }
.brand { font: 600 ${T(9.5)} 'Josefin Sans', sans-serif; letter-spacing: .32em; text-transform: uppercase; margin-bottom: ${G(3)}; }
.ptitle { font: 700 ${T(28)}/1 'Josefin Sans', sans-serif; text-transform: uppercase; letter-spacing: .12em; }
.stitle { font: 700 ${T(12)}/1.1 'Josefin Sans', sans-serif; text-transform: uppercase; letter-spacing: .22em;
  padding-bottom: ${G(3)}; border-bottom: 1px solid var(--accent); }
.sprice { font: 600 ${T(11)} 'Inter', sans-serif; margin-top: ${G(3)}; }
.snote { font: italic 400 ${T(10)} 'Inter', sans-serif; margin-top: ${G(3)}; color: #333; }
.iname { font: 600 ${T(11.5)}/1.25 'Inter', sans-serif; }
.lead { border-bottom: 1px dotted #888; transform: translateY(-.28em); min-width: .6em; }
.iprice { font: 600 ${T(11.5)} 'Inter', sans-serif; }
.item:not(:has(.ihead .iprice:not(:empty))) .lead { visibility: hidden; }
.idesc, .inote, .iprices, .iopts { font-size: ${T(10.5)}; line-height: 1.35; color: #333; margin-top: ${G(1.2)}; }
.inote { font-style: italic; }
.iprices .pl-price, .iopts .op-price { font-weight: 600; color: #111; }
.iprice-below { display: none; }
.item.compact .iname { font-weight: 500; font-size: ${T(10.5)}; }
.item.compact .idesc-inline { color: #555; }
.item.compact .iprice { font-size: ${T(10.5)}; }
.inline-group { font-size: ${T(10.5)}; line-height: 1.45; }
.inline-group .iprice { font-weight: 600; margin-left: .3em; }
.inline-group .iprice::before { content: '— '; font-weight: 400; color: #555; }
.untitled .keep > .inline-group:first-child { margin-top: ${G(9)}; }
.pf { text-align: left; border-top: 1px solid var(--accent); color: #333; }
`,
};

// 4. Band — the Canva look from the current breakfast and lunch: big display title,
// gray bands for section headings, name left / price right.
const band = {
  id: 'band',
  label: 'Band',
  bodyPt: 10.5,
  floorPt: FLOOR,
  faces: [
    ['Playfair Display', 700], ['Playfair Display', 900],
    ['Poppins', 400], ['Poppins', 500], ['Poppins', 600],
  ],
  css: `${common}
.page { font-family: 'Poppins', Arial, sans-serif; }
.brand { font: 600 ${T(10)} 'Poppins', sans-serif; letter-spacing: .3em; text-transform: uppercase; margin-bottom: ${G(2)}; }
.ptitle { font: 900 ${T(50)}/0.95 'Playfair Display', serif; text-transform: uppercase; letter-spacing: .02em; }
.size-half .ptitle { font-size: ${T(31)}; }
.ph::after { content: ''; display: block; width: 1.4in; height: ${G(4)}; min-height: 3px; margin: ${G(9)} auto 0; background: var(--accent); }
.size-half .ph::after { display: none; } /* bar book already has its bands */
.stitle { background: var(--accent); color: #fff; text-align: center; font: 600 ${T(11.5)}/1 'Poppins', sans-serif;
  text-transform: uppercase; letter-spacing: .3em; padding: ${G(6)} 0 ${G(5)}; }
.sprice { text-align: center; font: 600 ${T(13)} 'Poppins', sans-serif; margin-top: ${G(4)}; }
.snote { text-align: center; font: 500 ${T(10.5)} 'Poppins', sans-serif; text-decoration: underline; margin-top: ${G(4)}; }
.iname { font: 500 ${T(13)}/1.25 'Poppins', sans-serif; }
.lead { visibility: hidden; }
.iprice { font: 500 ${T(13)} 'Poppins', sans-serif; }
.idesc, .inote, .iprices, .iopts { font-size: ${T(10.5)}; line-height: 1.35; margin-top: ${G(1)}; }
.inote { font-style: italic; }
.iprices .pl-price, .iopts .op-price { font-weight: 600; }
.iprice-below { display: none; }
.item.compact .iname { font-size: ${T(10.5)}; font-weight: 400; }
.item.compact .idesc-inline { color: #444; }
.item.compact .iprice { font-size: ${T(10.5)}; font-weight: 500; }
.inline-group { text-align: center; font-size: ${T(11)}; line-height: 1.5; }
.inline-group .iprice { font-weight: 600; margin-left: .35em; }
.pf { border-top: 1px solid #111; }
`,
};

export const THEMES = { classic, fireside, trailhead, band };

export function getTheme(id) {
  const t = THEMES[id];
  if (!t) throw new Error(`Unknown theme "${id}". Options: ${Object.keys(THEMES).join(', ')}`);
  return t;
}
