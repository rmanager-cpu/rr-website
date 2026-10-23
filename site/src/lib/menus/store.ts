import 'server-only';
import seed from '@/content/seed-menus.json';
import { db, dbReady } from '@/lib/db/pool';

// Menus: read from the Supabase hub when it's connected, else from the starting menus imported from
// Popmenu (seed-menus.json), so the public pages always work. Writes need the database.

export type Price = { label: string | null; price: number };
export type Hours = { days: number[]; start: string; end: string; label: string };
export type Dish = { id: string; slug: string; name: string; description: string | null; tags: string[]; raw: boolean; photo: string | null; signature: boolean };
export type MenuItem = { id: string; sectionId: string; dish: Dish; sort: number; prices: Price[]; priceNote: string | null; description: string | null; hidden: boolean };
export type MenuSection = { id: string; name: string; note: string | null; sort: number; items: MenuItem[] };
export type Menu = {
  id: string; slug: string; name: string; sort: number; intro: string | null; hours: Hours[]; servingNote: string | null;
  footer: string | null; active: boolean; showUntil: string | null; sections: MenuSection[];
};

export const TAG_LABEL: Record<string, string> = {
  GF: 'Gluten friendly', GM: 'Gluten-free on request', CG: 'Contains gluten', DF: 'Dairy free', V: 'Vegetarian', VG: 'Vegan',
};

function seedMenus(): Menu[] {
  const dishes = new Map(seed.dishes.map((d) => [d.slug, { id: `dish-${d.slug}`, slug: d.slug, name: d.name, description: d.description, tags: d.tags, raw: d.raw, photo: null, signature: false } as Dish]));
  return seed.menus.map((m) => ({
    id: `menu-${m.slug}`, slug: m.slug, name: m.name, sort: m.sort, intro: m.intro, hours: m.hours as Hours[], servingNote: m.serving_note,
    footer: m.footer, active: true, showUntil: null,
    sections: m.sections.map((s, si) => ({
      id: `sec-${m.slug}-${si}`, name: s.name, note: s.note, sort: si,
      items: s.items.map((it, ii) => ({
        id: `item-${m.slug}-${si}-${ii}`, sectionId: `sec-${m.slug}-${si}`, dish: dishes.get(it.dish)!, sort: ii,
        prices: it.prices as Price[], priceNote: it.price_note, description: it.description, hidden: false,
      })),
    })),
  }));
}

/** Every menu with its sections and items. */
export async function listMenus(opts: { includeInactive?: boolean } = {}): Promise<Menu[]> {
  if (!(await dbReady())) return seedMenus();
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
      id: r.id, sectionId: r.section_id, sort: r.sort, prices: r.prices ?? [], priceNote: r.price_note, description: r.description, hidden: r.hidden,
      dish: { id: r.dish_id, slug: r.d_slug, name: r.d_name, description: r.d_description, tags: r.d_tags ?? [], raw: r.d_raw, photo: r.d_photo, signature: r.d_signature },
    };
    bySection.set(r.section_id, [...(bySection.get(r.section_id) ?? []), it]);
  }
  const byMenu = new Map<string, MenuSection[]>();
  for (const s of sections.rows) byMenu.set(s.menu_id, [...(byMenu.get(s.menu_id) ?? []), { id: s.id, name: s.name, note: s.note, sort: s.sort, items: bySection.get(s.id) ?? [] }]);
  return menus.rows
    .map((m) => ({
      id: m.id, slug: m.slug, name: m.name, sort: m.sort, intro: m.intro, hours: m.hours ?? [], servingNote: m.serving_note, footer: m.footer,
      active: m.active, showUntil: m.show_until ? new Date(m.show_until).toISOString().slice(0, 10) : null, sections: byMenu.get(m.id) ?? [],
    }))
    .filter((m) => opts.includeInactive || (m.active && (!m.showUntil || m.showUntil >= today)));
}

export async function menuBySlug(slug: string, opts: { includeInactive?: boolean } = {}) {
  return (await listMenus(opts)).find((m) => m.slug === slug) ?? null;
}

/** Where else each dish appears, with its prices there: used to flag price mismatches for staff. */
export function appearances(menus: Menu[]) {
  const out = new Map<string, { menu: string; prices: Price[]; priceNote: string | null }[]>();
  for (const m of menus) for (const s of m.sections) for (const i of s.items) {
    if (i.hidden) continue;
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
    const { rows } = await c.query('update site_menu_items set prices=$1, price_note=$2, hidden=$3, sort=$4 where id=$5 returning dish_id', [JSON.stringify(v.prices), v.priceNote, v.hidden, v.sort, itemId]);
    if (!rows[0]) throw new Error('That item no longer exists.');
    await c.query('update site_dishes set name=$1, description=$2, tags=$3, raw=$4, updated_at=now() where id=$5', [v.name, v.description, v.tags, v.raw, rows[0].dish_id]);
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

export async function saveMenu(id: string, v: { name: string; intro: string | null; servingNote: string | null; footer: string | null; active: boolean; showUntil: string | null; hours: Hours[] }) {
  await need();
  await db().query('update site_menus set name=$1, intro=$2, serving_note=$3, footer=$4, active=$5, show_until=$6, hours=$7, updated_at=now() where id=$8', [v.name, v.intro, v.servingNote, v.footer, v.active, v.showUntil, JSON.stringify(v.hours), id]);
}
