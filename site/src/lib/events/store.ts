import 'server-only';
import seed from '@/content/seed-events.json';
import { db, dbReady } from '@/lib/db/pool';

const hasDb = dbReady;
import type { ApplicationDetails, Category, EventLink, EventPage, EventSeries, JobApplication, Layout } from './types';

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
    photos: (r.photos as string[]) ?? [],
    links: (r.links as EventLink[]) ?? [],
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
    highlighted: Boolean(r.highlighted),
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
export type PageInput = { slug: string; title: string; summary: string | null; body: string | null; layout: Layout };
export type PageContent = { body: string | null; photos: string[]; links: EventLink[] };

async function needDb() {
  if (!(await hasDb())) throw new Error('The calendar database is not connected yet, so changes cannot be saved.');
}

const seriesParams = (s: SeriesInput) => [
  s.title, s.category, s.status, s.startsOn, s.endsOn, s.startTime, s.endTime, s.repeat, s.weekdays, s.skipHolidays,
  s.skipDates, s.offsite, s.location, s.note, s.ticketUrl, s.closedPrivate, s.closedRegular, s.venioSpaces, s.highlighted,
];

/** A web address nothing else uses: two events can share a name, so a repeat gets its date added. */
export async function freeSlug(slug: string, date: string): Promise<string> {
  await needDb();
  const taken = async (s: string) => (await db().query('select 1 from site_event_pages where slug = $1', [s])).rows.length > 0;
  if (!(await taken(slug))) return slug;
  const dated = `${slug.slice(0, 66)}-${date}`;
  if (!(await taken(dated))) return dated;
  for (let n = 2; ; n++) if (!(await taken(`${dated}-${n}`))) return `${dated}-${n}`;
}

/** Adds an event and its page together (a new page, or an existing one for a series that shares it). */
export async function createSeries(input: SeriesInput, page: { existingId: string } | { create: PageInput & PageContent }, by: string): Promise<{ seriesId: string; pageId: string }> {
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
        'insert into site_event_pages (slug, title, summary, body, hero_image, photos, links, layout, updated_by) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9) returning id',
        [p.slug, p.title, p.summary, p.body, p.photos[0] ?? null, p.photos, JSON.stringify(p.links), p.layout, by],
      );
      pageId = rows[0].id;
    }
    const { rows } = await client.query(
      `insert into site_events (title, category, status, starts_on, ends_on, start_time, end_time, repeat, weekdays, skip_holidays,
         skip_dates, offsite, location, note, ticket_url, closed_private, closed_regular, venio_spaces, highlighted, page_id, updated_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) returning id`,
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
       closed_regular=$17, venio_spaces=$18, highlighted=$19, updated_at=now(), updated_by=$21 where id=$20`,
    [...seriesParams(input), id, by],
  );
}

export async function updatePage(id: string, p: PageInput, by: string) {
  await needDb();
  await db().query(
    'update site_event_pages set slug=$1, title=$2, summary=$3, body=$4, layout=$5, updated_at=now(), updated_by=$7 where id=$6',
    [p.slug, p.title, p.summary, p.body, p.layout, id, by],
  );
}

/** What the Add to Calendar form edits on an event's page. A summary already written is left alone. */
export async function updatePageContent(id: string, c: PageContent, summary: string | null, by: string) {
  await needDb();
  await db().query(
    'update site_event_pages set body=$1, photos=$2, links=$3::jsonb, hero_image=$4, summary=coalesce(summary,$5), updated_at=now(), updated_by=$7 where id=$6',
    [c.body, c.photos, JSON.stringify(c.links), c.photos[0] ?? null, summary, id, by],
  );
}

/** Removes an event. Its page and uploaded photos go too, unless another event still shares the page. */
export async function deleteSeries(id: string) {
  await needDb();
  const client = await db().connect();
  try {
    await client.query('begin');
    const { rows } = await client.query('delete from site_events where id = $1 returning page_id', [id]);
    const pageId = rows[0]?.page_id;
    if (pageId) {
      const shared = await client.query('select 1 from site_events where page_id = $1 limit 1', [pageId]);
      if (!shared.rows.length) {
        const gone = await client.query('delete from site_event_pages where id = $1 returning photos', [pageId]);
        const photoIds = ((gone.rows[0]?.photos as string[]) ?? []).filter((p) => p.startsWith(PHOTO_PATH)).map((p) => p.slice(PHOTO_PATH.length));
        if (photoIds.length) await client.query('delete from site_event_photos where id = any($1::uuid[])', [photoIds]);
      }
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}

// ---------- uploaded event photos ----------

/** Where the site serves uploaded photos from. */
const PHOTO_PATH = '/event-photos/';

export async function addPhoto(bytes: Buffer, width: number, height: number, by: string): Promise<string> {
  await needDb();
  const { rows } = await db().query('insert into site_event_photos (bytes, width, height, created_by) values ($1,$2,$3,$4) returning id', [bytes, width, height, by]);
  return `${PHOTO_PATH}${rows[0].id}`;
}

export async function photoBytes(id: string): Promise<Buffer | null> {
  if (!(await hasDb())) return null;
  const { rows } = await db().query('select bytes from site_event_photos where id = $1', [id]);
  return rows[0]?.bytes ?? null;
}

// ---------- job applications ----------

export async function addApplication(a: {
  name: string; email: string | null; phone: string | null; department: string; details: ApplicationDetails;
  resume: { bytes: Buffer; filename: string; mime: string } | null;
}) {
  await needDb();
  const client = await db().connect();
  try {
    await client.query('begin');
    let resumeId: string | null = null;
    if (a.resume) {
      const { rows } = await client.query('insert into site_job_resumes (bytes, filename, mime) values ($1,$2,$3) returning id', [a.resume.bytes, a.resume.filename, a.resume.mime]);
      resumeId = rows[0].id;
    }
    await client.query(
      'insert into site_job_applications (name, email, phone, department, details, resume_id) values ($1,$2,$3,$4,$5::jsonb,$6)',
      [a.name, a.email, a.phone, a.department, JSON.stringify(a.details), resumeId],
    );
    await client.query('commit');
  } catch (e) {
    await client.query('rollback').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** A resume for /admin: the file and its name. */
export async function resumeFile(id: string): Promise<{ bytes: Buffer; filename: string; mime: string } | null> {
  const { rows } = await db().query('select bytes, filename, mime from site_job_resumes where id = $1', [id]);
  return rows[0] ?? null;
}

export async function listApplications(): Promise<JobApplication[]> {
  if (!(await hasDb())) return [];
  const { rows } = await db().query(
    'select a.*, r.filename as resume_filename from site_job_applications a left join site_job_resumes r on r.id = a.resume_id order by a.created_at desc limit 500',
  );
  return rows.map((r) => ({
    id: String(r.id),
    createdAt: new Date(r.created_at).toISOString(),
    name: r.name,
    email: r.email,
    phone: r.phone,
    department: r.department,
    status: r.status,
    notes: r.notes,
    details: r.details ?? {},
    resume: r.resume_id ? { id: String(r.resume_id), filename: r.resume_filename } : null,
  }));
}

export async function setApplicationStatus(id: string, status: JobApplication['status']) {
  await needDb();
  await db().query('update site_job_applications set status=$1 where id=$2', [status, id]);
}

// ---------- band booking requests ----------

export type BookingRequest = {
  id: string;
  createdAt: string;
  actName: string;
  contact: string;
  email: string | null;
  phone: string | null;
  genre: string | null;
  hometown: string | null;
  links: string | null;
  dates: string | null;
  message: string | null;
  status: 'new' | 'reviewing' | 'booked' | 'passed';
};

export async function addBookingRequest(b: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) {
  await needDb();
  await db().query(
    'insert into site_booking_requests (act_name, contact, email, phone, genre, hometown, links, dates, message) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [b.actName, b.contact, b.email, b.phone, b.genre, b.hometown, b.links, b.dates, b.message],
  );
}

export async function listBookingRequests(): Promise<BookingRequest[]> {
  if (!(await hasDb())) return [];
  const { rows } = await db().query('select * from site_booking_requests order by created_at desc limit 500');
  return rows.map((r) => ({
    id: String(r.id), createdAt: new Date(r.created_at).toISOString(), actName: r.act_name, contact: r.contact, email: r.email, phone: r.phone,
    genre: r.genre, hometown: r.hometown, links: r.links, dates: r.dates, message: r.message, status: r.status,
  }));
}

export async function setBookingStatus(id: string, status: BookingRequest['status']) {
  await needDb();
  await db().query('update site_booking_requests set status=$1 where id=$2', [status, id]);
}
