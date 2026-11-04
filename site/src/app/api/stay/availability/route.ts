import { NextResponse, type NextRequest } from 'next/server';
import { fetchLiveRates } from '@/lib/bookingcenter-api';

export const dynamic = 'force-dynamic';

const MAX_NIGHTS = 30;
const MAX_DAYS_AHEAD = 730;
const MAX_GUESTS = 4; // The most any one room sleeps.
const DAY_MS = 86_400_000;
const TIME_ZONE = 'America/Los_Angeles';

// One server's count, so it slows a burst without being a guarantee. The rates cache does the rest.
const WINDOW_MS = 60_000;
const LIMIT = 30;
const hits = new Map<string, { start: number; count: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const h = hits.get(ip);
  if (!h || now - h.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  h.count += 1;
  return h.count > LIMIT;
}

/** Milliseconds for a real calendar date in 'YYYY-MM-DD', else null. */
function dayOf(s: string | null): number | null {
  const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const at = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(at).toISOString().slice(0, 10) === s ? at : null;
}

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Live rooms and rates for a stay. `status: 'off'` means use the handoff to BookingCenter instead. */
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (limited(ip)) return json({ status: 'busy' }, 429);

  const q = req.nextUrl.searchParams;
  const checkIn = q.get('checkIn');
  const checkOut = q.get('checkOut');
  const guests = Number(q.get('guests') ?? '2');
  const inDay = dayOf(checkIn);
  const outDay = dayOf(checkOut);
  const today = dayOf(new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date()));
  if (
    !checkIn || !checkOut || inDay === null || outDay === null || today === null ||
    !Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS ||
    outDay <= inDay || outDay - inDay > MAX_NIGHTS * DAY_MS ||
    inDay < today || inDay - today > MAX_DAYS_AHEAD * DAY_MS
  ) {
    return json({ status: 'invalid' }, 400);
  }

  const pending = fetchLiveRates({ checkIn, checkOut, guests });
  if (!pending) return json({ status: 'off' });
  try {
    const { rooms, test } = await pending;
    return json({ status: 'ok', rooms, test, nights: Math.round((outDay - inDay) / DAY_MS) });
  } catch (e) {
    console.error('Live rates unavailable:', e instanceof Error ? e.message : 'unknown error');
    return json({ status: 'off' }, 503);
  }
}
