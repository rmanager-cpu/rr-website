// The home page's "Coming up": the next big events, one card each, picked by staff. In the events editor
// (/admin) an event marked "Show on the home page" appears here on its next date, soonest first, three
// at most. If staff haven't marked anything, the next few dated events (holidays, community nights and
// the like) stand in, so the section is never empty. Pure: the page passes in the data and "today".
import { homePhotos, photos } from '@/content/photos';
import { addDays, formatDate, nextDate, timeRange, weekdaysPhrase } from '@/lib/events/recurrence';
import type { Category, EventPage, EventSeries } from '@/lib/events/types';
import { spoken } from '@/components/calendar/days';

export type ComingUp = {
  key: string;
  title: string;
  date: string; // YYYY-MM-DD, the next date it happens
  num: number; // 26
  month: string; // Nov
  weekday: string; // Thursday
  /** "Thursdays, 5 to 9 PM" for a weekly event, the time (if any) for a one-off */
  when: string | null;
  line: string | null;
  chip: string;
  chipLabel: string;
  href: string | null;
  photo: { src: string; alt: string };
};

export const COMING_UP_MAX = 3;
const HORIZON = 180; // days ahead a marked event can be shown
const FALLBACK_HORIZON = 60;

const CHIP: Record<Category, [string, string]> = {
  'happy-hour': ['food', 'Happy hour'],
  food: ['food', 'Food and drink'],
  music: ['music', 'Music'],
  holiday: ['holiday', 'Holiday'],
  community: ['community', 'Community'],
  special: ['special', 'Special'],
  'off-site': ['offsite', 'Off-site'],
};

/** Real photos of the place for events without their own: scenes, never claims about the event. Each
 *  category has a few, so two cards never share a picture. */
const PHOTOS: Record<Category, { src: string; alt: string }[]> = {
  'happy-hour': [photos.bartender, homePhotos.bar],
  food: [homePhotos.dining, photos.lantern, photos.fireplacePrivateDinner],
  music: [homePhotos.bar, photos.patioNight],
  holiday: [photos.heroDusk, photos.heroNight, photos.snowyRiverLodge, homePhotos.dining],
  community: [photos.frontEntranceNight, homePhotos.entrance, homePhotos.bar],
  special: [photos.lantern, photos.fireplacePrivateDinner, homePhotos.dining],
  'off-site': [photos.frontEntranceNight, homePhotos.entrance],
};
const ANY = [photos.heroDusk, homePhotos.entrance, photos.lantern, photos.heroNight, homePhotos.dining];

const usable = (s: string | null | undefined) => (s && s.trim() && !/lorem ipsum/i.test(s) ? s : null);

export function buildComingUp(series: EventSeries[], pages: EventPage[], today: string): ComingUp[] {
  const pageOf = new Map(pages.map((p) => [p.id, p]));
  const live = series.filter((s) => s.status === 'published');

  const withDate = (list: EventSeries[], horizon: number) =>
    list
      .map((s) => ({ s, date: nextDate(s, series, today, horizon) }))
      .filter((x): x is { s: EventSeries; date: string } => x.date !== null && x.date <= addDays(today, horizon))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.s.startTime ?? '99').localeCompare(b.s.startTime ?? '99'));

  let picked = withDate(live.filter((s) => s.highlighted), HORIZON);
  if (picked.length === 0) {
    // Nothing marked: the next one-off events stand in (not the everyday happy hour).
    picked = withDate(live.filter((s) => s.repeat === 'none' && s.category !== 'happy-hour'), FALLBACK_HORIZON);
  }

  const used = new Set<string>();
  return picked.slice(0, COMING_UP_MAX).map(({ s, date }) => {
    const page = pageOf.get(s.pageId);
    const [chip, chipLabel] = CHIP[s.category];
    const time = spoken(timeRange(s));
    const when = s.repeat === 'weekly' ? `${spoken(weekdaysPhrase(s.weekdays))}${time ? `, ${time}` : ''}` : time || null;
    const line = [usable(page?.summary), s.offsite && s.location ? s.location : null].filter(Boolean).join(' · ') || null;
    const own = page?.heroImage ?? page?.photos[0] ?? null;
    const photo = own
      ? { src: own, alt: `${s.title} at River Ranch` }
      : [...PHOTOS[s.category], ...ANY].find((ph) => !used.has(ph.src)) ?? PHOTOS[s.category][0];
    used.add(photo.src);
    return {
      key: `${s.id}-${date}`,
      title: s.title,
      date,
      num: Number(date.slice(8)),
      month: formatDate(date, { month: 'short' }),
      weekday: formatDate(date, { weekday: 'long' }),
      when,
      line,
      chip,
      chipLabel,
      href: page ? `/dine/happening/${page.slug}` : null,
      photo,
    };
  });
}
