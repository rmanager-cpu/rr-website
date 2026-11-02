import 'server-only';
import seed from '@/content/seed-menus.json';
import { db, dbReady } from '@/lib/db/pool';

// Menus: read from the Supabase hub when it's connected, else from the starting menus imported from
// Popmenu (seed-menus.json), so the public pages always work. Writes need the database.

export type Price = { label: string | null; price: number };
export type Hours = { days: number[]; start: string; end: string; label: string };
export type Dish = { id: string; slug: string; name: string; description: string | null; tags: string[]; raw: boolean; photo: string | null; signature: boolean };
export type MenuItem = { id: string; sectionId: string; dish: Dish; sort: number; prices: Price[]; priceNote: string | null; description: string | null; hidden: boolean; print?: ItemPrint };
export type MenuSection = { id: string; name: string; note: string | null; sort: number; items: MenuItem[]; print?: SectionPrint };
// regular: on the website. holiday: on the website while switched on, with its own prices. banquet: staff-only, never priced.
export type MenuKind = 'regular' | 'holiday' | 'banquet';
export type Menu = {
  id: string; slug: string; name: string; sort: number; intro: string | null; hours: Hours[]; servingNote: string | null;
  footer: string | null; active: boolean; showUntil: string | null; sections: MenuSection[]; kind: MenuKind; print?: MenuPrint;
};

// Print layout only; dishes and prices are the same ones the website shows.
export type ItemPrint = { note?: string; options?: { name: string; price: string }[]; noGf?: boolean };
export type SectionPrint = { page?: number; style?: string; columns?: number; newColumn?: boolean; heading?: string; price?: string; hideTitle?: boolean };
export type PageLayout = { title?: string; subtitle?: string; columns?: number; footer?: string[]; minTypePt?: number };
export type MenuPrint = { theme?: string; size?: string; accent?: string; brand?: string; minTypePt?: number; legend?: Record<string, unknown>; notices?: Record<string, string>; pages?: PageLayout[] };

export const TAG_LABEL: Record<string, string> = {
  GF: 'Gluten friendly', GM: 'Gluten-free on request', CG: 'Contains gluten', DF: 'Dairy free', V: 'Vegetarian', VG: 'Vegan',
};

type SeedItem = { dish: string; prices: Price[]; price_note: string | null; description: string | null; print?: ItemPrint };
type SeedSection = { name: string; note: string | null; items: SeedItem[]; print?: SectionPrint };
type SeedMenu = { slug: string; name: string; sort: number; intro: string | null; hours: unknown; serving_note: string | null; footer: string | null; active?: boolean; kind?: MenuKind; sections: SeedSection[]; print?: MenuPrint };

function seedMenus(): Menu[] {
  const dishes = new Map(seed.dishes.map((d) => [d.slug, { id: `dish-${d.slug}`, slug: d.slug, name: d.name, description: d.description, tags: d.tags, raw: d.raw, photo: null, signature: false } as Dish]));
  return (seed.menus as unknown as SeedMenu[]).map((m) => ({
    id: `menu-${m.slug}`, slug: m.slug, name: m.name, sort: m.sort, intro: m.intro, hours: m.hours as Hours[], servingNote: m.serving_note,
    footer: m.footer, active: m.active ?? true, showUntil: null, kind: m.kind ?? 'regular', print: m.print,
    sections: m.sections.map((s, si) => ({
      id: `sec-${m.slug}-${si}`, name: s.name, note: s.note, sort: si, print: s.print,
      items: s.items.map((it, ii) => ({
        id: `item-${m.slug}-${si}-${ii}`, sectionId: `sec-${m.slug}-${si}`, dish: dishes.get(it.dish)!, sort: ii,
        prices: it.prices, priceNote: it.price_note, description: it.description, hidden: false, print: it.print,
      })),
    })),
  }));
}

/** On the public site: switched on, not past its date, and never a banquet menu. */
const isPublic = (m: Menu, today: string) => m.kind !== 'banquet' && m.active && (!m.showUntil || m.showUntil >= today);

/** A dish marked gluten free on one menu can be made differently on another, so that menu drops the mark. */
const perMenuMarks = (menus: Menu[]): Menu[] =>
  menus.map((m) => ({
    ...m,
    sections: m.sections.map((s) => ({
      ...s,
      items: s.items.map((i) => (i.print?.noGf ? { ...i, dish: { ...i.dish, tags: i.dish.tags.filter((t) => t !== 'GF') } } : i)),
    })),
  }));

/** Every menu with its sections and items. Staff pages pass includeInactive to see all of them. */
export async function listMenus(opts: { includeInactive?: boolean } = {}): Promise<Menu[]> {
  return perMenuMarks(await readMenus(opts));
}

async function readMenus(opts: { includeInactive?: boolean }): Promise<Menu[]> {
  if (!(await dbReady())) {
    const all = seedMenus();
    return opts.includeInactive ? all : all.filter((m) => isPublic(m, new Date().toISOString().slice(0, 10)));
  }
  const pool = db();
  const [menus, sections, items] = await Promise.all([
    pool.query('select * from site_menus order by sort, name'),
    pool.query('select * from site_menu_sections order by sort'),
    pool.query('select i.*, d.slug as d_slug, d.name as d_name, d.description as d_description, d.tags as d_tags, d.raw as d_raw, d.photo as d_photo, d.signature as d_signature from site_menu_items i join site_dishes d on d.id = i.dish_id order by i.sort'),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const bySection = new Map<string, MenuItem[]>();
  for (const r of items.rows) {
    const it: MenuItem = {
      id: r.id, sectionId: r.section_id, sort: r.sort, prices: r.prices ?? [], priceNote: r.price_note, description: r.description, hidden: r.hidden, print: r.print ?? undefined,
      dish: { id: r.dish_id, slug: r.d_slug, name: r.d_name, description: r.d_description, tags: r.d_tags ?? [], raw: r.d_raw, photo: r.d_photo, signature: r.d_signature },
    };
    bySection.set(r.section_id, [...(bySection.get(r.section_id) ?? []), it]);
  }
  const byMenu = new Map<string, MenuSection[]>();
  for (const s of sections.rows) byMenu.set(s.menu_id, [...(byMenu.get(s.menu_id) ?? []), { id: s.id, name: s.name, note: s.note, sort: s.sort, print: s.print ?? undefined, items: bySection.get(s.id) ?? [] }]);
  return menus.rows
    .map((m) => ({
      id: m.id, slug: m.slug, name: m.name, sort: m.sort, intro: m.intro, hours: m.hours ?? [], servingNote: m.serving_note, footer: m.footer,
      active: m.active, showUntil: m.show_until ? new Date(m.show_until).toISOString().slice(0, 10) : null, sections: byMenu.get(m.id) ?? [],
      kind: m.kind as MenuKind, print: m.print ?? undefined,
    }))
    .filter((m) => opts.includeInactive || isPublic(m, today));
}

export async function menuBySlug(slug: string, opts: { includeInactive?: boolean } = {}) {
  return (await listMenus(opts)).find((m) => m.slug === slug) ?? null;
}

/** Where else each dish appears, with its prices there: used to flag price mismatches for staff. */
export function appearances(menus: Menu[]) {
  const out = new Map<string, { menu: string; prices: Price[]; priceNote: string | null }[]>();
  for (const m of menus) for (const s of m.sections) for (const i of s.items) {
    if (i.hidden || !m.active || m.kind !== 'regular') continue; // event menus price dishes on purpose, or not at all
    out.set(i.dish.id, [...(out.get(i.dish.id) ?? []), { menu: m.name, prices: i.prices, priceNote: i.priceNote }]);
  }
  return out;
}

export const priceText = (all: Price[], note: string | null, p = all.filter((x) => typeof x.price === "number")) =>
  note && !p.length ? note : p.map((x) => (x.label ? `${x.label} $${x.price}` : `$${x.price}`)).join(' / ');

/** "Half 12 / Full 17" or "18" → prices. Throws on anything it can't read. */
export function parsePrices(text: string): Price[] {
  const t = text.trim();
  if (!t) return [];
  return t.split('/').map((part) => {
    const m = part.trim().match(/^(.*?)\s*\$?\s*(\d+(?:\.\d{1,2})?)$/);
    if (!m) throw new Error(`Couldn’t read the price “${part.trim()}”. Use numbers like 18 or Half 12 / Full 17.`);
    return { label: m[1].trim() || null, price: Number(m[2]) };
  });
}

// ---------- writes ----------
async function need() {
  if (!(await dbReady())) throw new Error('The menu database is not connected yet, so changes cannot be saved.');
}

export async function saveItem(itemId: string, v: { name: string; description: string | null; tags: string[]; raw: boolean; prices: Price[]; priceNote: string | null; hidden: boolean; sort: number }) {
  await need();
  const c = await db().connect();
  try {
    await c.query('begin');
    const { rows: before } = await c.query('select description, print from site_menu_items where id=$1', [itemId]);
    if (!before[0]) throw new Error('That item no longer exists.');
    // Not gluten free on this menu: leaving the box empty mustn't clear the mark on the dish's other
    // menus, and ticking it means this menu's version is gluten free after all.
    let tags = v.tags;
    if (before[0].print?.noGf) {
      if (tags.includes('GF')) await c.query(`update site_menu_items set print = print - 'noGf' where id=$1`, [itemId]);
      else tags = [...tags, 'GF'];
    }
    // An item with its own wording keeps it to this menu; otherwise the edit goes to the shared dish.
    const ownWording = before[0].description !== null;
    const { rows } = await c.query('update site_menu_items set prices=$1, price_note=$2, hidden=$3, sort=$4, description=$5 where id=$6 returning dish_id', [JSON.stringify(v.prices), v.priceNote, v.hidden, v.sort, ownWording ? v.description ?? '' : null, itemId]);
    await c.query('update site_dishes set name=$1, tags=$2, raw=$3, updated_at=now() where id=$4', [v.name, tags, v.raw, rows[0].dish_id]);
    if (!ownWording) await c.query('update site_dishes set description=$1 where id=$2', [v.description, rows[0].dish_id]);
    await c.query('update site_menus m set updated_at=now() from site_menu_sections s, site_menu_items i where i.id=$1 and s.id=i.section_id and m.id=s.menu_id', [itemId]);
    await c.query('commit');
  } catch (e) {
    await c.query('rollback');
    throw e;
  } finally {
    c.release();
  }
}

export async function addItem(sectionId: string, v: { name: string; slug: string; description: string | null; prices: Price[] }) {
  await need();
  const c = await db().connect();
  try {
    await c.query('begin');
    let { rows } = await c.query('select id from site_dishes where slug=$1', [v.slug]);
    if (!rows[0]) ({ rows } = await c.query('insert into site_dishes (slug, name, description) values ($1,$2,$3) returning id', [v.slug, v.name, v.description]));
    await c.query('insert into site_menu_items (section_id, dish_id, sort, prices) values ($1,$2,(select coalesce(max(sort),0)+1 from site_menu_items where section_id=$1),$3)', [sectionId, rows[0].id, JSON.stringify(v.prices)]);
    await c.query('commit');
  } catch (e) {
    await c.query('rollback');
    throw e;
  } finally {
    c.release();
  }
}

export async function saveSection(id: string, v: { name: string; note: string | null; sort: number }) {
  await need();
  await db().query('update site_menu_sections set name=$1, note=$2, sort=$3 where id=$4', [v.name, v.note, v.sort, id]);
}

export async function addSection(menuId: string, name: string) {
  await need();
  await db().query('insert into site_menu_sections (menu_id, name, sort) values ($1,$2,(select coalesce(max(sort),0)+1 from site_menu_sections where menu_id=$1))', [menuId, name]);
}

export async function saveMenu(id: string, v: { name: string; intro: string | null; servingNote: string | null; footer: string | null; active: boolean; showUntil: string | null; hours: Hours[]; theme: string }) {
  await need();
  await db().query(
    `update site_menus set name=$1, intro=$2, serving_note=$3, footer=$4, active=$5, show_until=$6, hours=$7, print=coalesce(print, '{}'::jsonb) || jsonb_build_object('theme', $9::text), updated_at=now() where id=$8`,
    [v.name, v.intro, v.servingNote, v.footer, v.active, v.showUntil, JSON.stringify(v.hours), id, v.theme],
  );
}

/** A new holiday or banquet menu: a copy of that kind's template, switched off until someone turns it on. */
export async function newEventMenu(kind: 'holiday' | 'banquet', name: string, intro: string | null, slugBase: string): Promise<string> {
  await need();
  const c = await db().connect();
  try {
    await c.query('begin');
    const { rows: [tpl] } = await c.query('select id, print, footer from site_menus where slug=$1', [`${kind}-template`]);
    if (!tpl) throw new Error(`The ${kind} template is missing.`);
    const { rows: [{ taken }] } = await c.query('select count(*)::int as taken from site_menus where slug=$1 or slug like $2', [slugBase, `${slugBase}-%`]);
    const slug = taken ? `${slugBase}-${taken + 1}` : slugBase;
    const { rows: [menu] } = await c.query(
      `insert into site_menus (slug, name, intro, footer, active, kind, print, sort) values ($1,$2,$3,$4,false,$5,$6,(select coalesce(max(sort),0)+1 from site_menus)) returning id`,
      [slug, name, intro, tpl.footer, kind, tpl.print],
    );
    const { rows: sections } = await c.query('select * from site_menu_sections where menu_id=$1 order by sort', [tpl.id]);
    for (const s of sections) {
      const { rows: [copy] } = await c.query('insert into site_menu_sections (menu_id, name, note, sort, print) values ($1,$2,$3,$4,$5) returning id', [menu.id, s.name, s.note, s.sort, s.print]);
      await c.query(
        'insert into site_menu_items (section_id, dish_id, sort, prices, price_note, description, hidden, print) select $1, dish_id, sort, prices, price_note, description, hidden, print from site_menu_items where section_id=$2',
        [copy.id, s.id],
      );
    }
    await c.query('commit');
    return slug;
  } catch (e) {
    await c.query('rollback');
    throw e;
  } finally {
    c.release();
  }
}

/** Removes a holiday or banquet menu. Regular menus and the two templates can't be deleted here. */
export async function deleteEventMenu(id: string) {
  await need();
  await db().query(`delete from site_menus where id=$1 and kind in ('holiday','banquet') and slug not in ('holiday-template','banquet-template')`, [id]);
}
