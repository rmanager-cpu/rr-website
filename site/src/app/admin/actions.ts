'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkPassword, editor, endSession, isSignedIn, startSession } from '@/lib/admin/session';
import { createSeries, setApplicationStatus, updatePage, updateSeries, type PageInput, type SeriesInput } from '@/lib/events/store';
import { CATEGORIES, LAYOUTS, type Category, type JobApplication, type Layout } from '@/lib/events/types';

export type FormState = { ok: boolean; message: string; field?: string } | null;

// ---------- sign in ----------
const tries = new Map<string, { n: number; until: number }>();

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const key = 'admin';
  const t = tries.get(key);
  if (t && t.until > Date.now() && t.n >= 8) return { ok: false, message: 'Too many tries. Wait a few minutes and try again.' };
  if (!checkPassword(String(form.get('password') ?? ''))) {
    tries.set(key, { n: (t && t.until > Date.now() ? t.n : 0) + 1, until: Date.now() + 10 * 60_000 });
    return { ok: false, message: 'That password isn’t right.' };
  }
  tries.delete(key);
  startSession();
  redirect('/admin');
}

export async function signOut() {
  endSession();
  redirect('/admin/login');
}

function guard() {
  if (!isSignedIn()) redirect('/admin/login');
}

// ---------- parsing ----------
const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const opt = (f: FormData, k: string) => str(f, k) || null;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

export const slugify = async (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'event';

class Invalid extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}

function parseSeries(f: FormData): SeriesInput {
  const title = str(f, 'title');
  if (!title) throw new Invalid('title', 'Give the event a name.');
  const category = str(f, 'category') as Category;
  if (!CATEGORIES.includes(category)) throw new Invalid('category', 'Choose what kind of event it is.');
  const repeat = str(f, 'repeat') === 'weekly' ? 'weekly' : 'none';
  const startsOn = str(f, 'starts_on');
  if (!DATE.test(startsOn)) throw new Invalid('starts_on', repeat === 'weekly' ? 'Pick the first date it runs.' : 'Pick the date.');
  const endsOn = opt(f, 'ends_on');
  if (endsOn && (!DATE.test(endsOn) || endsOn < startsOn)) throw new Invalid('ends_on', 'The last date has to be on or after the first.');
  const startTime = opt(f, 'start_time');
  const endTime = opt(f, 'end_time');
  if (startTime && !TIME.test(startTime)) throw new Invalid('start_time', 'Check the start time.');
  if (endTime && (!TIME.test(endTime) || !startTime)) throw new Invalid('end_time', 'Add a start time before an end time.');
  const weekdays = f.getAll('weekdays').map(Number).filter((n) => n >= 1 && n <= 7);
  if (repeat === 'weekly' && !weekdays.length) throw new Invalid('weekdays', 'Pick the days it repeats on.');
  const skipDates = str(f, 'skip_dates').split(/[\s,]+/).filter(Boolean);
  if (skipDates.some((d) => !DATE.test(d))) throw new Invalid('skip_dates', 'Skip dates must look like 2026-12-24, separated by commas.');
  const yn = (k: string, label: string) => {
    const v = str(f, k);
    if (v !== 'yes' && v !== 'no') throw new Invalid(k, `Answer: ${label}`);
    return v === 'yes';
  };
  const closedPrivate = yn('closed_private', 'is River Ranch closed for private events?');
  const closedRegular = yn('closed_regular', 'is River Ranch closed for regular service?');
  const venioSpaces = f.getAll('venio_spaces').map(String).filter((s) => s && s !== '__none');
  if (!f.getAll('venio_spaces').length) throw new Invalid('venio_spaces', 'Answer: which space? (Choose “No specific space” if none.)');
  const offsite = str(f, 'offsite') === 'yes';
  return {
    title,
    category,
    status: (['draft', 'published', 'cancelled'].includes(str(f, 'status')) ? str(f, 'status') : 'published') as SeriesInput['status'],
    startsOn,
    endsOn: repeat === 'none' ? null : endsOn,
    startTime,
    endTime,
    repeat,
    weekdays: repeat === 'weekly' ? weekdays : [],
    skipHolidays: str(f, 'skip_holidays') === 'yes',
    skipDates,
    offsite,
    location: offsite ? opt(f, 'location') : null,
    note: opt(f, 'note'),
    ticketUrl: opt(f, 'ticket_url'),
    closedPrivate,
    closedRegular,
    venioSpaces,
  };
}

async function parsePage(f: FormData, fallbackTitle: string): Promise<PageInput> {
  const title = str(f, 'page_title') || fallbackTitle;
  const slug = await slugify(str(f, 'page_slug') || title);
  const layout = str(f, 'page_layout') as Layout;
  return {
    slug,
    title,
    summary: opt(f, 'page_summary'),
    body: opt(f, 'page_body'),
    heroImage: opt(f, 'page_hero'),
    layout: LAYOUTS.includes(layout) ? layout : 'standard',
  };
}

const friendly = (e: unknown): FormState => {
  if (e instanceof Invalid) return { ok: false, message: e.message, field: e.field };
  const msg = e instanceof Error ? e.message : String(e);
  if (/site_event_pages_slug_key|duplicate key/.test(msg)) return { ok: false, message: 'There’s already a page with that web address. Change the page title or address.', field: 'page_slug' };
  if (/not connected/.test(msg)) return { ok: false, message: msg };
  return { ok: false, message: 'That didn’t save. Please try again.' };
};

function refresh(slug?: string) {
  revalidatePath('/events');
  revalidatePath('/');
  if (slug) revalidatePath(`/events/${slug}`);
  revalidatePath('/admin');
}

// ---------- events ----------
export async function createEvent(_prev: FormState, f: FormData): Promise<FormState> {
  guard();
  let slug: string | undefined;
  try {
    const series = parseSeries(f);
    const pageChoice = str(f, 'page_choice');
    let page: { existingId: string } | { create: PageInput };
    if (pageChoice === 'existing') {
      const id = str(f, 'page_existing');
      if (!id) throw new Invalid('page_existing', 'Choose which page this event shares.');
      page = { existingId: id };
    } else if (pageChoice === 'new') {
      const p = await parsePage(f, series.title);
      slug = p.slug;
      page = { create: p };
    } else {
      throw new Invalid('page_choice', 'Every event needs a page: make a new one, or share an existing one.');
    }
    await createSeries(series, page, editor());
  } catch (e) {
    return friendly(e);
  }
  refresh(slug);
  redirect('/admin?saved=1');
}

export async function saveEvent(id: string, _prev: FormState, f: FormData): Promise<FormState> {
  guard();
  try {
    await updateSeries(id, parseSeries(f), editor());
  } catch (e) {
    return friendly(e);
  }
  refresh(str(f, 'page_slug_current') || undefined);
  return { ok: true, message: 'Saved.' };
}

export async function savePage(id: string, _prev: FormState, f: FormData): Promise<FormState> {
  guard();
  let p: PageInput;
  try {
    p = await parsePage(f, str(f, 'page_title'));
    await updatePage(id, p, editor());
  } catch (e) {
    return friendly(e);
  }
  refresh(p.slug);
  return { ok: true, message: 'Saved. The page is updated on the site.' };
}

export async function setApplication(id: string, status: JobApplication['status']) {
  guard();
  await setApplicationStatus(id, status);
  revalidatePath('/admin/applications');
}

export async function setBooking(id: string, status: 'new' | 'reviewing' | 'booked' | 'passed') {
  guard();
  const { setBookingStatus } = await import('@/lib/events/store');
  await setBookingStatus(id, status);
  revalidatePath('/admin/bookings');
}

// ---------- menus ----------
const menuRefresh = (slug?: string) => {
  revalidatePath('/menus');
  if (slug) revalidatePath(`/menus/${slug}`);
  revalidatePath('/admin/menus');
};

export async function saveMenuItemAction(itemId: string, menuSlug: string, _prev: FormState, f: FormData): Promise<FormState> {
  guard();
  const { saveItem, parsePrices } = await import('@/lib/menus/store');
  try {
    const name = str(f, 'name');
    if (!name) throw new Invalid('name', 'Give the dish a name.');
    await saveItem(itemId, {
      name,
      description: opt(f, 'description'),
      tags: f.getAll('tags').map(String),
      raw: str(f, 'raw') === 'yes',
      prices: parsePrices(str(f, 'prices')),
      priceNote: opt(f, 'price_note'),
      hidden: str(f, 'hidden') === 'yes',
      sort: Number(str(f, 'sort')) || 0,
    });
  } catch (e) {
    return e instanceof Invalid ? { ok: false, message: e.message } : { ok: false, message: e instanceof Error ? e.message : 'That didn’t save.' };
  }
  menuRefresh(menuSlug);
  return { ok: true, message: 'Saved' };
}

export async function addMenuItemAction(sectionId: string, menuSlug: string, _prev: FormState, f: FormData): Promise<FormState> {
  guard();
  const { addItem, parsePrices } = await import('@/lib/menus/store');
  try {
    const name = str(f, 'name');
    if (!name) throw new Invalid('name', 'Give the dish a name.');
    await addItem(sectionId, { name, slug: await slugify(name), description: opt(f, 'description'), prices: parsePrices(str(f, 'prices')) });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'That didn’t save.' };
  }
  menuRefresh(menuSlug);
  return { ok: true, message: 'Added' };
}

export async function saveSectionAction(sectionId: string, menuSlug: string, _prev: FormState, f: FormData): Promise<FormState> {
  guard();
  const { saveSection } = await import('@/lib/menus/store');
  try {
    await saveSection(sectionId, { name: str(f, 'name') || 'Section', note: opt(f, 'note'), sort: Number(str(f, 'sort')) || 0 });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'That didn’t save.' };
  }
  menuRefresh(menuSlug);
  return { ok: true, message: 'Saved' };
}

export async function addSectionAction(menuId: string, menuSlug: string, f: FormData) {
  guard();
  const { addSection } = await import('@/lib/menus/store');
  const name = str(f, 'name');
  if (name) await addSection(menuId, name);
  menuRefresh(menuSlug);
}

export async function saveMenuAction(menuId: string, menuSlug: string, _prev: FormState, f: FormData): Promise<FormState> {
  guard();
  const { saveMenu } = await import('@/lib/menus/store');
  try {
    const hours = [0, 1, 2].flatMap((n) => {
      const days = f.getAll(`h${n}_days`).map(Number).filter((d) => d >= 1 && d <= 7);
      const start = str(f, `h${n}_start`), end = str(f, `h${n}_end`);
      if (!days.length || !TIME.test(start) || !TIME.test(end)) return [];
      return [{ days, start, end, label: str(f, `h${n}_label`) || 'Hours' }];
    });
    const showUntil = opt(f, 'show_until');
    if (showUntil && !DATE.test(showUntil)) throw new Invalid('show_until', 'Check the “show until” date.');
    await saveMenu(menuId, { name: str(f, 'name') || 'Menu', intro: opt(f, 'intro'), servingNote: opt(f, 'serving_note'), footer: opt(f, 'footer'), active: str(f, 'active') === 'yes', showUntil, hours });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'That didn’t save.' };
  }
  menuRefresh(menuSlug);
  return { ok: true, message: 'Saved. The menu is updated on the site.' };
}
