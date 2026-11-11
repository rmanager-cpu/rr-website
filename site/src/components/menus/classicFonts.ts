import { Libre_Baskerville, Zilla_Slab } from 'next/font/google';

// The Classic menu look, the same faces as the printed menus' Classic theme (lib/print-menu/themes.mjs):
// Zilla Slab capitals for menu, section and dish names, Libre Baskerville for everything else. Only the
// menu pages use them, so the rest of the site never loads them.
const slab = Zilla_Slab({ subsets: ['latin'], weight: ['600', '700'], display: 'swap', variable: '--font-menu-slab' });
const book = Libre_Baskerville({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], display: 'swap', variable: '--font-menu-book' });

/** Put on the element that holds a menu (or menu cards) so the Classic faces apply inside it. */
export const classicFonts = `${slab.variable} ${book.variable}`;
