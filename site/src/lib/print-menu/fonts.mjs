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

const cache = new Map();

/** faces: [['Inter', 400, 'normal'], ...] */
export function fontFaceCss(faces) {
  return faces
    .map(([family, weight, style = 'normal']) => {
      const key = `${family}|${weight}|${style}`;
      if (!cache.has(key)) {
        const pkg = FAMILIES[family];
        if (!pkg) throw new Error(`Unknown font family: ${family}`);
        const file = path.join(process.cwd(), 'print-fonts', `${pkg}-latin-${weight}-${style}.woff2`);
        const b64 = readFileSync(file).toString('base64');
        cache.set(key, `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url(data:font/woff2;base64,${b64}) format('woff2');}`);
      }
      return cache.get(key);
    })
    .join('\n');
}
