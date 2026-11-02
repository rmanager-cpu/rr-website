import type { Menu, MenuItem, MenuSection } from './store';

// Turns a menu from the editor into the print engine's format. Web and print share the same dishes and
// prices; the only print-specific data is layout (which page a section sits on, its style, the theme).

const printPrice = (i: MenuItem) => {
  if (i.priceNote) return { price: i.priceNote };
  if (!i.prices.length) return {};
  if (i.prices.some((p) => p.label)) return { prices: i.prices.map((p) => ({ label: p.label ?? '', price: String(p.price) })) };
  return { price: i.prices.map((p) => String(p.price)).join('/') };
};

function printItem(i: MenuItem, noPrices: boolean, legend: Record<string, unknown>) {
  // A mark only prints on a menu whose fine print explains it.
  const tags = [...(i.dish.tags.includes('GF') && !i.print?.noGf && legend.gf ? ['gf'] : []), ...(i.dish.raw && legend.raw ? ['raw'] : [])];
  const description = i.description ?? i.dish.description;
  return {
    name: i.dish.name,
    ...(tags.length ? { tags } : {}),
    ...(description ? { description } : {}),
    ...(noPrices ? {} : printPrice(i)),
    ...(i.print?.note ? { note: i.print.note } : {}),
    ...(i.print?.options && !noPrices ? { options: i.print.options } : {}),
  };
}

function printSection(s: MenuSection, noPrices: boolean, legend: Record<string, unknown>) {
  const p = s.print ?? {};
  const shown = s.items.filter((i) => !i.hidden);
  const items = shown.map((i) => printItem(i, noPrices, legend));
  const base = {
    ...(p.hideTitle ? {} : { title: s.name }),
    ...(s.note ? { note: s.note } : {}),
    ...(p.style ? { style: p.style } : {}),
    ...(p.columns ? { columns: p.columns } : {}),
    ...(p.newColumn ? { newColumn: true } : {}),
    ...(p.heading ? { heading: p.heading } : {}),
    ...(p.price && !noPrices ? { price: p.price } : {}),
  };
  if (p.style !== 'inline') return { ...base, items };
  // Inline lists run together, with neighbors at the same price sharing one price.
  const groups: { price?: string; items: string[] }[] = [];
  for (const it of items) {
    const price = 'price' in it ? (it.price as string) : undefined;
    const last = groups[groups.length - 1];
    if (last && last.price === price) last.items.push(it.name);
    else groups.push({ ...(price ? { price } : {}), items: [it.name] });
  }
  return { ...base, groups };
}

/** The menu as the print engine reads it. Banquet menus never carry prices. */
export function toPrintMenu(menu: Menu) {
  const print = menu.print ?? {};
  const noPrices = menu.kind === 'banquet';
  const layouts = print.pages?.length ? print.pages : [{ footer: ['consumer'] }];
  const lastPage = layouts.length - 1;
  const sections = menu.sections.filter((s) => s.items.some((i) => !i.hidden));
  return {
    id: menu.slug,
    name: menu.name,
    size: print.size ?? 'letter',
    ...(print.accent ? { accent: print.accent } : {}),
    ...(print.brand ? { brand: print.brand } : {}),
    ...(print.minTypePt ? { minTypePt: print.minTypePt } : {}),
    legend: print.legend ?? {},
    ...(print.notices ? { notices: print.notices } : {}),
    pages: layouts.map((layout, n) => ({
      ...layout,
      // Event menus show their heading and subheading on the first page.
      ...(menu.kind !== 'regular' && n === 0 ? { title: menu.name, ...(menu.intro ? { subtitle: menu.intro } : {}) } : {}),
      // A section added in the editor with no page yet lands on the last page, so it can't go missing.
      sections: sections.filter((s) => Math.min(s.print?.page ?? lastPage, lastPage) === n).map((s) => printSection(s, noPrices, print.legend ?? {})),
    })),
  };
}

export const defaultTheme = (menu: Menu) => menu.print?.theme ?? 'classic';
