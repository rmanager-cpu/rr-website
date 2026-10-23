// Turns event series into calendar dates. Pure: no database, no clock (callers pass "today").
import type { EventSeries, Occurrence } from './types';

const DAY = 86_400_000;

export const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const toIso = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => toIso(new Date(toDate(iso).getTime() + n * DAY));
/** ISO weekday, 1 = Monday … 7 = Sunday. */
export const isoWeekday = (iso: string) => ((toDate(iso).getUTCDay() + 6) % 7) + 1;

/** Today's date in Tahoe City. */
export function todayInTahoe(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Dates that hold a published holiday event (happy hour and others skip these). */
export function holidayDates(all: EventSeries[]): Set<string> {
  const out = new Set<string>();
  for (const s of all) if (s.category === 'holiday' && s.status === 'published' && s.repeat === 'none') out.add(s.startsOn);
  return out;
}

/** Every date of one series between from and to (inclusive). */
export function datesOf(series: EventSeries, from: string, to: string, holidays: Set<string>): string[] {
  if (series.status !== 'published') return [];
  const start = series.startsOn > from ? series.startsOn : from;
  const lastPossible = series.endsOn ?? (series.repeat === 'none' ? series.startsOn : to);
  const end = lastPossible < to ? lastPossible : to;
  if (start > end) return [];
  if (series.repeat === 'none') return series.startsOn >= from && series.startsOn <= to ? [series.startsOn] : [];
  const skip = new Set(series.skipDates);
  const out: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    if (!series.weekdays.includes(isoWeekday(d))) continue;
    if (skip.has(d)) continue;
    if (series.skipHolidays && holidays.has(d)) continue;
    out.push(d);
  }
  return out;
}

/** All occurrences of all series between from and to, sorted by date then start time. */
export function occurrences(all: EventSeries[], from: string, to: string): Occurrence[] {
  const holidays = holidayDates(all);
  const out: Occurrence[] = [];
  for (const s of all) for (const date of datesOf(s, from, to, holidays)) out.push({ series: s, date });
  return out.sort((a, b) => (a.date === b.date ? (a.series.startTime ?? '99').localeCompare(b.series.startTime ?? '99') : a.date.localeCompare(b.date)));
}

/** The next date a series happens on or after today, or null. */
export function nextDate(series: EventSeries, all: EventSeries[], today: string, horizonDays = 400): string | null {
  return datesOf(series, today, addDays(today, horizonDays), holidayDates(all))[0] ?? null;
}

// ---------- words ----------

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function formatTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  if (h === 23 && m === 59) return 'midnight';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${suffix}` : `${h12} ${suffix}`;
}

export function timeRange(s: Pick<EventSeries, 'startTime' | 'endTime'>): string {
  if (!s.startTime) return '';
  if (!s.endTime) return formatTime(s.startTime);
  const a = formatTime(s.startTime);
  const b = formatTime(s.endTime);
  // "3–5 PM" when both share AM/PM
  if (a.endsWith(' PM') && b.endsWith(' PM')) return `${a.replace(' PM', '')}–${b}`;
  if (a.endsWith(' AM') && b.endsWith(' AM')) return `${a.replace(' AM', '')}–${b}`;
  return `${a}–${b}`;
}

export function weekdaysPhrase(days: number[]): string {
  const d = [...days].sort();
  if (d.length === 7) return 'Every day';
  if (d.join() === '1,2,3,4,5') return 'Monday–Friday';
  if (d.join() === '6,7') return 'Weekends';
  if (d.length === 1) return `${WEEKDAY_LONG[d[0] - 1]}s`;
  return d.map((n) => WEEKDAY_SHORT[n - 1]).join(', ');
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }): string {
  return new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'UTC' }).format(toDate(iso));
}

/** "Monday–Friday, 3–5 PM · through Sep 6, 2027" or "Fri, Oct 23 · 9 PM–midnight". */
export function whenPhrase(s: EventSeries): string {
  const time = timeRange(s);
  if (s.repeat === 'weekly') {
    const until = s.endsOn ? ` · through ${formatDate(s.endsOn, { month: 'short', day: 'numeric', year: 'numeric' })}` : '';
    return `${weekdaysPhrase(s.weekdays)}${time ? `, ${time}` : ''}${until}`;
  }
  return `${formatDate(s.startsOn, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}${time ? ` · ${time}` : ''}`;
}
