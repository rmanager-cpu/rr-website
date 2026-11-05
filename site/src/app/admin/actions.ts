'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkPassword, editor, endSession, isSignedIn, startSession } from '@/lib/admin/session';
import { todayInTahoe } from '@/lib/events/recurrence';
import { createSeries, deleteSeries, freeSlug, pageById, seriesById, setApplicationStatus, updatePage, updatePageContent, updateSeries, type PageContent, type PageInput, type SeriesInput } from '@/lib/events/store';
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

/** A safe outside link: adds https:// if it was left off, and refuses anything that isn't a web address. */
function webUrl(raw: string, field: string): string {
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  let url: URL | null = null;
  try {
    url = new URL(withScheme);
  } catch {}
  if (!url || !['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) throw new Invalid(field, `“${raw}” doesn’t look like a web address.`);
  return url.href;
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
  // Only an event that closes something answers Venio's questions; a no clears any earlier answers.
  const closes = str(f, 'closes') === 'yes';
  const closedPrivate = closes && yn('closed_private', 'is River Ranch closed for private events?');
  const closedRegular = closes && yn('closed_regular', 'is River Ranch closed for regular service?');
  const venioSpaces = closes ? f.getAll('venio_spaces').map(String).filter((s) => s && s !== '__none') : [];
  if (closes && !f.getAll('venio_spaces').length) throw new Invalid('venio_spaces', 'Answer: which space? (Choose “No specific space” if none.)');
  const offsite = str(f, 'offsite') === 'yes';
  const ticketUrl = opt(f, 'ticket_url');
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
    ticketUrl: ticketUrl && webUrl(ticketUrl, 'ticket_url'),
    highlighted: str(f, 'highlighted') === 'yes',
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
    layout: LAYOUTS.includes(layout) ? layout : 'standard',
  };
}

function parseContent(f: FormData): PageContent {
  const labels = f.getAll('link_label').map((v) => String(v).trim());
  const links = f.getAll('link_url').flatMap((v, i) => {
    const raw = String(v).trim();
    if (!raw) return [];
    if (!labels[i]) throw new Invalid('link_label', `Add the words to show for the link to ${raw}.`);
    return [{ label: labels[i], url: webUrl(raw, 'link_url') }];
  });
  return {
    body: opt(f, 'page_body'),
    photos: f.getAll('photos').map(String).filter((p) => /^\/[\w./-]+$/.test(p) && !p.includes('..')).slice(0, 8),
    links: links.slice(0, 5),
  };
}

/** The line Google shows, taken from the details until someone writes a better one on the page editor. */
function summaryFrom(body: string | null): string | null {
  const first = body?.split(/\n{2,}/)[0].replace(/\s+/g, ' ').trim();
  if (!first) return null;
  return first.length <= 160 ? first : `${first.slice(0, 160).replace(/\s+\S*$/, '')}…`;
}

const needsPhoto = () => new Invalid('highlighted', 'A highlighted event needs a photo. Add one, or turn off the highlight.');

const friendly = (e: unknown): FormState => {
  if (e instanceof Invalid) return { ok: false, message: e.message, field: e.field };
  const msg = e instanceof Error ? e.message : String(e);
  if (/site_event_pages_slug_key|duplicate key/.test(msg)) return { ok: false, message: 'There’s already a page with that web address. Change the page title or address.', field: 'page_slug' };
  if (/not connected/.test(msg)) return { ok: false, message: msg };
  return { ok: false, message: 'That didn’t save. Please try again.' };
};

function refresh(slug?: string) {
  revalidatePath('/dine/happening');
  revalidatePath('/');
  if (slug) revalidatePath(`/dine/happening/${slug}`);
  revalidatePath('/admin');
}

// ---------- events ----------
export async function createEvent(_prev: FormState, f: FormData): Promise<FormState> {
  guard();
  let slug: string | undefined;
  try {
    const series = parseSeries(f);
    const lastDate = series.endsOn ?? series.startsOn;
    if (series.repeat === 'none' && lastDate < todayInTahoe()) throw new Invalid('starts_on', 'That date has already passed. Check the date.');
    let page: { existingId: string } | { create: PageInput & PageContent };
    if (str(f, 'page_choice') === 'existing') {
      const id = str(f, 'page_existing');
      if (!id) throw new Invalid('page_existing', 'Choose which page this event shares.');
      const shared = await pageById(id);
      if (series.highlighted && !shared?.heroImage) throw needsPhoto();
      slug = shared?.slug;
      page = { existingId: id };
    } else {
      const content = parseContent(f);
      if (series.highlighted && !content.photos.length) throw needsPhoto();
      const p = await parsePage(f, series.title);
      slug = await freeSlug(p.slug, series.startsOn);
      page = { create: { ...p, ...content, slug, summary: p.summary ?? summaryFrom(content.body) } };
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
    const series = parseSeries(f);
    const content = parseContent(f);
    if (series.highlighted && !content.photos.length) throw needsPhoto();
    const current = await seriesById(id);
    if (!current) throw new Invalid('title', 'That event no longer exists.');
    await updateSeries(id, series, editor());
    await updatePageContent(current.pageId, content, summaryFrom(content.body), editor());
  } catch (e) {
    return friendly(e);
  }
  refresh(str(f, 'page_slug_current') || undefined);
  return { ok: true, message: 'Saved.' };
}

export async function deleteEventAction(id: string) {
  guard();
  await deleteSeries(id);
  refresh();
  redirect('/admin?deleted=1');
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
  revalidatePath('/dine/menus');
  if (slug) revalidatePath(`/dine/menus/${slug}`);
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
    const theme = ['classic', 'fireside', 'trailhead', 'band'].includes(str(f, 'theme')) ? str(f, 'theme') : 'classic';
    await saveMenu(menuId, { name: str(f, 'name') || 'Menu', intro: opt(f, 'intro'), servingNote: opt(f, 'serving_note'), footer: opt(f, 'footer'), active: str(f, 'active') === 'yes', showUntil, hours, theme });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'That didn’t save.' };
  }
  menuRefresh(menuSlug);
  return { ok: true, message: 'Saved.' };
}

export async function newEventMenuAction(kind: 'holiday' | 'banquet', _prev: FormState, f: FormData): Promise<FormState> {
  guard();
  const { newEventMenu } = await import('@/lib/menus/store');
  const name = str(f, 'name');
  if (!name) return { ok: false, message: 'Give it a heading.' };
  let slug: string;
  try {
    slug = await newEventMenu(kind, name, opt(f, 'intro'), await slugify(name));
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'That didn’t save.' };
  }
  menuRefresh();
  redirect(`/admin/menus/${slug}`);
}

export async function deleteEventMenuAction(menuId: string) {
  guard();
  const { deleteEventMenu } = await import('@/lib/menus/store');
  await deleteEventMenu(menuId);
  menuRefresh();
  redirect('/admin/menus');
}
