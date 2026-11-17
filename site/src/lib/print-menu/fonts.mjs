// Embeds fonts as base64 @font-face rules so every menu is a self-contained file (same output on the
// server, in a browser preview, or on someone's laptop). The files live in site/print-fonts.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const FAMILIES = {
  'Zilla Slab': 'zilla-slab',
  'Libre Baskerville': 'libre-baskerville',
  'Cormorant Garamond': 'cormorant-garamond',
  'Josefin Sans': 'josefin-sans',
  'Inter': 'inter',
  'Playfair Display': 'playfair-display',
  'Poppins': 'poppins',
};

// Each face comes in two files (Fontsource's subsets): basic Latin, and extended Latin for letters like
// Ÿ (what "Aÿ" becomes in capitals), Ż or Č. The browser picks the file by the letter's range, so a
// name never falls back to a system font (which looks wrong, or prints as an empty box on the server).
const SUBSETS = {
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
};

const cache = new Map();

/** faces: [['Inter', 400, 'normal'], ...] */
export function fontFaceCss(faces) {
  return faces
    .map(([family, weight, style = 'normal']) => {
      const key = `${family}|${weight}|${style}`;
      if (!cache.has(key)) {
        const pkg = FAMILIES[family];
        if (!pkg) throw new Error(`Unknown font family: ${family}`);
        const rules = Object.entries(SUBSETS).map(([subset, range]) => {
          const b64 = readFileSync(path.join(process.cwd(), 'print-fonts', `${pkg}-${subset}-${weight}-${style}.woff2`)).toString('base64');
          return `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url(data:font/woff2;base64,${b64}) format('woff2');unicode-range:${range};}`;
        });
        cache.set(key, rules.join('\n'));
      }
      return cache.get(key);
    })
    .join('\n');
}
