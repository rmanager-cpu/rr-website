// Builds the day-by-day calendar on /dine/happening: today plus the days after it, from the real
// events calendar (published series only) and the regular hours in content/site.ts. Pure: the page
// passes in the data and "today", and gets back plain objects it can hand to the client calendar.
import { homePhotos, photos } from '@/content/photos';
import { hours } from '@/content/site';
import { addDays, formatDate, isoWeekday, occurrences, timeRange, weekdaysPhrase } from '@/lib/events/recurrence';
import type { Category, EventPage, EventSeries } from '@/lib/events/types';

export type DayEvent = {
  key: string;
  title: string;
  time: string;
  /** chip class suffix (chip--music, chip--food, …) and its label */
  chip: string;
  chipLabel: string;
  href: string | null;
  line: string | null;
  music: boolean;
  /** dinner and breakfast from the regular hours, not from the events calendar */
  regular: boolean;
  /** the calendar category, or null for the regular hours */
  category: Category | null;
};

export type Day = {
  date: string; // YYYY-MM-DD
  dow: string; // Mon
  weekday: string; // Monday
  title: string; // Monday, November 9
  month: string; // November
  num: number;
  state: 'lit' | 'warm' | 'quiet';
  tag: string;
  dots: string[]; // CSS colors
  mood: string;
  events: DayEvent[];
  /** a real River Ranch photo that suits the day (shown beside the open day) */
  photo: { src: string; alt: string };
};

const CHIP: Record<Category, [string, string]> = {
  'happy-hour': ['food', 'Happy hour'],
  food: ['food', 'Food and drink'],
  music: ['music', 'Music'],
  holiday: ['holiday', 'Holiday'],
  community: ['community', 'Community'],
  special: ['special', 'Special'],
  'off-site': ['offsite', 'Off-site'],
};

const DOT: Record<Category, string> = {
  'happy-hour': 'var(--ev-food)',
  food: 'var(--ev-food)',
  music: 'var(--ev-music)',
  holiday: 'var(--ev-lodge)',
  special: 'var(--ev-lodge)',
  community: 'var(--ev-community)',
  'off-site': 'var(--ev-community)',
};

const TAG: Record<Category, string> = {
  'happy-hour': '',
  food: 'Special',
  music: 'Music',
  holiday: 'Holiday',
  special: 'Special',
  community: 'Event',
  'off-site': 'Off-site',
};

// Seed pages still carry placeholder text in a few summaries; never show it.
const usable = (s: string | null | undefined) => (s && !/lorem ipsum/i.test(s) ? s : null);

/** "3–5 PM" reads "3 to 5 PM" on the home page, like the footer. */
export const spoken = (t: string) => t.replace('–', ' to ');

function whenOf(s: EventSeries): string {
  const t = spoken(timeRange(s));
  if (t) return t;
  if (s.repeat === 'weekly') return weekdaysPhrase(s.weekdays);
  if (s.category === 'holiday') return 'Holiday';
  return 'All day';
}

export function buildDays(series: EventSeries[], pages: EventPage[], today: string, count = 14): Day[] {
  const last = addDays(today, count - 1);
  const pageOf = new Map(pages.map((p) => [p.id, p]));
  const all = occurrences(
    series.filter((s) => s.status === 'published'),
    today,
    last,
  );

  return Array.from({ length: count }, (_, i) => {
    const date = addDays(today, i);
    const wd = isoWeekday(date); // 1 = Monday … 7 = Sunday
    const todays = all.filter((o) => o.date === date);
    const closed = todays.some((o) => o.series.closedRegular);

    const events: (DayEvent & { sort: string })[] = todays.map((o) => {
      const s = o.series;
      const page = pageOf.get(s.pageId);
      const [chip, chipLabel] = CHIP[s.category];
      const line = [usable(page?.summary), s.offsite && s.location ? s.location : null].filter(Boolean).join(' · ') || null;
      return {
        key: `${s.id}-${date}`,
        title: s.title,
        time: whenOf(s),
        chip,
        chipLabel,
        href: page ? `/dine/happening/${page.slug}` : null,
        line,
        music: s.category === 'music',
        regular: false,
        category: s.category,
        sort: s.startTime ?? '99',
      };
    });

    // The regular hours, unless the place is closed to the public that day.
    if (!closed) {
      if (wd >= 6) {
        events.push({ key: `breakfast-${date}`, title: hours.breakfast.label, time: spoken(hours.breakfast.time), chip: 'plain', chipLabel: 'Every weekend', href: '/dine/menus', line: null, music: false, regular: true, category: null, sort: hours.breakfast.opens });
      }
      events.push({ key: `dinner-${date}`, title: hours.dinner.label, time: spoken(hours.dinner.time), chip: 'plain', chipLabel: 'Every night', href: '/dine/menus', line: null, music: false, regular: true, category: null, sort: hours.dinner.opens });
    }
    events.sort((a, b) => a.sort.localeCompare(b.sort));

    const cats = todays.map((o) => o.series.category);
    const music = cats.includes('music');
    const special = cats.filter((c) => c !== 'happy-hour' && c !== 'music');
    const state: Day['state'] = music ? 'lit' : special.length ? 'warm' : 'quiet';

    let mood: string;
    if (closed) mood = 'Closed to the public today for a private event.';
    else if (cats.includes('holiday')) mood = 'A big day on the river.';
    else if (music) mood = 'The bar gets loud tonight.';
    else if (cats.includes('off-site')) mood = 'Find us out on the town.';
    else if (cats.includes('community')) mood = 'Bring the neighbors.';
    else if (special.length) mood = 'Something good on the stove. Come hungry.';
    else if (wd >= 6) mood = `Slow morning. Breakfast until ${hours.breakfast.time.split('–')[1]}.`;
    else if (cats.includes('happy-hour')) mood = 'A quiet one. Happy hour starts at three.';
    else mood = 'A quiet one. Dinner from five.';

    const tagCat = music ? 'music' : special[0];

    // A photo for the day: a scene from the place, never a claim about the day's program.
    const pic = closed
      ? photos.fireplacePrivateDinner
      : cats.includes('holiday')
        ? photos.heroDusk
        : music
          ? homePhotos.bar
          : cats.includes('food') || cats.includes('special')
            ? homePhotos.dining
            : cats.includes('community') || cats.includes('off-site')
              ? photos.frontEntranceNight
              : wd >= 6
                ? photos.breakfast
                : cats.includes('happy-hour')
                  ? photos.bartender
                  : photos.lantern;
    const dots = [...new Set(cats.map((c) => DOT[c]))];

    return {
      date,
      dow: formatDate(date, { weekday: 'short' }),
      weekday: formatDate(date, { weekday: 'long' }),
      title: formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' }),
      month: formatDate(date, { month: 'long' }),
      num: Number(date.slice(8)),
      state,
      tag: i === 0 ? 'Today' : tagCat ? TAG[tagCat] : '',
      dots,
      mood,
      events: events.map(({ sort: _sort, ...e }) => e),
      photo: { src: pic.src, alt: pic.alt },
    };
  });
}

/** "November 9 to 22" or "November 23 to December 6". */
export function rangeLabel(days: Day[]): string {
  const a = days[0].date;
  const b = days[days.length - 1].date;
  const month = (d: string) => formatDate(d, { month: 'long' });
  return a.slice(0, 7) === b.slice(0, 7)
    ? `${month(a)} ${Number(a.slice(8))} to ${Number(b.slice(8))}`
    : `${month(a)} ${Number(a.slice(8))} to ${month(b)} ${Number(b.slice(8))}`;
}
