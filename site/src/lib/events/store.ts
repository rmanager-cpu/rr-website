import 'server-only';
import seed from '@/content/seed-events.json';
import { db, dbReady } from '@/lib/db/pool';

const hasDb = dbReady;
import type { Category, EventPage, EventSeries, JobApplication, Layout } from './types';

// Reads and writes the calendar. With the database connected (SITE_DATABASE_URL) everything lives in
// the Supabase hub and the staff editor can change it; without it, the site shows the starting events
// from seed-events.json (read-only), so the public pages never break.

type Row = Record<string, unknown>;
const iso = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v ? String(v).slice(0, 10) : null);
const hhmm = (v: unknown) => (v ? String(v).slice(0, 5) : null);

function pageFrom(r: Row): EventPage {
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    summary: (r.summary as string) ?? null,
    body: (r.body as string) ?? null,
    heroImage: (r.hero_image as string) ?? null,
    layout: r.layout as Layout,
    updatedAt: r.updated_at ? new Date(r.updated_at as string).toISOString() : '',
  };
}

function seriesFrom(r: Row): EventSeries {
  return {
    id: String(r.id),
    pageId: String(r.page_id),
    title: String(r.title),
    category: r.category as Category,
    status: (r.status as EventSeries['status']) ?? 'published',
    startsOn: iso(r.starts_on)!,
    endsOn: iso(r.ends_on),
    startTime: hhmm(r.start_time),
    endTime: hhmm(r.end_time),
    repeat: (r.repeat as 'none' | 'weekly') ?? 'none',
    weekdays: ((r.weekdays as number[]) ?? []).map(Number),
    skipHolidays: Boolean(r.skip_holidays),
    skipDates: ((r.skip_dates as unknown[]) ?? []).map((d) => iso(d)!),
    offsite: Boolean(r.offsite),
    location: (r.location as string) ?? null,
    note: (r.note as string) ?? null,
    ticketUrl: (r.ticket_url as string) ?? null,
    closedPrivate: Boolean(r.closed_private),
    closedRegular: Boolean(r.closed_regular),
    venioSpaces: (r.venio_spaces as string[]) ?? [],
    updatedAt: r.updated_at ? new Date(r.updated_at as string).toISOString() : '',
  };
}

// ---------- the built-in starting data ----------
function seedData() {
  const pages = seed.pages.map((p) => pageFrom({ ...p, id: `page-${p.slug}` }));
  const events = seed.events.map((e, i) => seriesFrom({ ...e, id: `seed-${i}`, page_id: `page-${e.page}`, status: 'published' }));
  return { pages, events };
}

export async function listPages(): Promise<EventPage[]> {
  if (!(await hasDb())) return seedData().pages;
  const { rows } = await db().query('select * from site_event_pages order by title');
  return rows.map(pageFrom);
}

export async function listSeries(): Promise<EventSeries[]> {
  if (!(await hasDb())) return seedData().events;
  const { rows } = await db().query('select * from site_events order by starts_on, start_time nulls first');
  return rows.map(seriesFrom);
}

export async function pageBySlug(slug: string): Promise<EventPage | null> {
  if (!(await hasDb())) return seedData().pages.find((p) => p.slug === slug) ?? null;
  const { rows } = await db().query('select * from site_event_pages where slug = $1', [slug]);
  return rows[0] ? pageFrom(rows[0]) : null;
}

export async function pageById(id: string): Promise<EventPage | null> {
  if (!(await hasDb())) return seedData().pages.find((p) => p.id === id) ?? null;
  const { rows } = await db().query('select * from site_event_pages where id = $1', [id]);
  return rows[0] ? pageFrom(rows[0]) : null;
}

export async function seriesById(id: string): Promise<EventSeries | null> {
  if (!(await hasDb())) return seedData().events.find((e) => e.id === id) ?? null;
  const { rows } = await db().query('select * from site_events where id = $1', [id]);
  return rows[0] ? seriesFrom(rows[0]) : null;
}

/** Venio's spaces, for the "which space?" question. Falls back to Venio's seeded list. */
export async function venioSpaces(): Promise<string[]> {
  const fallback = ['Alpine Dining Room', 'Whole inside', 'Riverview Room', 'The Point', 'Patio Bar', 'Half Patio', 'Full Patio'];
  if (!(await hasDb())) return fallback;
  try {
    const { rows } = await db().query('select name from spaces order by sort_order nulls last, name');
    return rows.length ? rows.map((r) => String(r.name)) : fallback;
  } catch {
    return fallback;
  }
}

// ---------- writes (database only) ----------

export type SeriesInput = Omit<EventSeries, 'id' | 'pageId' | 'updatedAt'>;
export type PageInput = { slug: string; title: string; summary: string | null; body: string | null; heroImage: string | null; layout: Layout };

async function needDb() {
  if (!(await hasDb())) throw new Error('The calendar database is not connected yet, so changes cannot be saved.');
}

const seriesParams = (s: SeriesInput) => [
  s.title, s.category, s.status, s.startsOn, s.endsOn, s.startTime, s.endTime, s.repeat, s.weekdays, s.skipHolidays,
  s.skipDates, s.offsite, s.location, s.note, s.ticketUrl, s.closedPrivate, s.closedRegular, s.venioSpaces,
];

/** Adds an event and its page together (a new page, or an existing one for a series that shares it). */
export async function createSeries(input: SeriesInput, page: { existingId: string } | { create: PageInput }, by: string): Promise<{ seriesId: string; pageId: string }> {
  await needDb();
  const client = await db().connect();
  try {
    await client.query('begin');
    let pageId: string;
    if ('existingId' in page) {
      pageId = page.existingId;
    } else {
      const p = page.create;
      const { rows } = await client.query(
        'insert into site_event_pages (slug, title, summary, body, hero_image, layout, updated_by) values ($1,$2,$3,$4,$5,$6,$7) returning id',
        [p.slug, p.title, p.summary, p.body, p.heroImage, p.layout, by],
      );
      pageId = rows[0].id;
    }
    const { rows } = await client.query(
      `insert into site_events (title, category, status, starts_on, ends_on, start_time, end_time, repeat, weekdays, skip_holidays,
         skip_dates, offsite, location, note, ticket_url, closed_private, closed_regular, venio_spaces, page_id, updated_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) returning id`,
      [...seriesParams(input), pageId, by],
    );
    await client.query('commit');
    return { seriesId: rows[0].id, pageId };
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}

export async function updateSeries(id: string, input: SeriesInput, by: string) {
  await needDb();
  await db().query(
    `update site_events set title=$1, category=$2, status=$3, starts_on=$4, ends_on=$5, start_time=$6, end_time=$7, repeat=$8,
       weekdays=$9, skip_holidays=$10, skip_dates=$11, offsite=$12, location=$13, note=$14, ticket_url=$15, closed_private=$16,
       closed_regular=$17, venio_spaces=$18, updated_at=now(), updated_by=$20 where id=$19`,
    [...seriesParams(input), id, by],
  );
}

export async function updatePage(id: string, p: PageInput, by: string) {
  await needDb();
  await db().query(
    'update site_event_pages set slug=$1, title=$2, summary=$3, body=$4, hero_image=$5, layout=$6, updated_at=now(), updated_by=$8 where id=$7',
    [p.slug, p.title, p.summary, p.body, p.heroImage, p.layout, id, by],
  );
}

// ---------- job applications ----------

export async function addApplication(a: { name: string; email: string | null; phone: string | null; department: string }) {
  await needDb();
  await db().query('insert into site_job_applications (name, email, phone, department) values ($1,$2,$3,$4)', [a.name, a.email, a.phone, a.department]);
}

export async function listApplications(): Promise<JobApplication[]> {
  if (!(await hasDb())) return [];
  const { rows } = await db().query('select * from site_job_applications order by created_at desc limit 500');
  return rows.map((r) => ({
    id: String(r.id),
    createdAt: new Date(r.created_at).toISOString(),
    name: r.name,
    email: r.email,
    phone: r.phone,
    department: r.department,
    status: r.status,
    notes: r.notes,
  }));
}

export async function setApplicationStatus(id: string, status: JobApplication['status']) {
  await needDb();
  await db().query('update site_job_applications set status=$1 where id=$2', [status, id]);
}
