import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { TheWeek } from '@/components/calendar/TheWeek';
import { buildDays, rangeLabel } from '@/components/calendar/days';
import { Lines } from '@/components/fl/Lines';
import { RiverCam } from '@/components/RiverCam';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { breadcrumbSchema, eventSchema, JsonLd, MARKABLE_EVENT_CATEGORIES } from '@/lib/schema';
import { addDays, formatDate, nextDate, occurrences, timeRange, todayInTahoe, whenPhrase } from '@/lib/events/recurrence';
import { listPages, listSeries } from '@/lib/events/store';
import type { EventPage, EventSeries } from '@/lib/events/types';
import { chipFor } from './chips';
import './happening.css';

export const revalidate = 300;

/** The day-by-day calendar covers four weeks: two show at first, with a button for the other two. */
const DAYS = 28;
const DAYS_SHOWN = 14;

/** Placeholder text left in the events store never reaches the page or Google. */
const real = (s: string | null | undefined) => (s && s.trim() && !/lorem ipsum/i.test(s) ? s : null);

export const metadata: Metadata = {
  title: 'Events, Live Music & Happy Hour in Tahoe City',
  description:
    'What’s on at River Ranch in Tahoe City: happy hour Monday to Friday 3–5 PM, Prime Rib Thursdays, live music on the riverside patio, holiday dinners and community events.',
  alternates: { canonical: '/dine/happening' },
};

export default async function EventsPage() {
  const [series, pages] = await Promise.all([listSeries(), listPages()]);
  const pageOf = new Map(pages.map((p) => [p.id, p]));
  const today = todayInTahoe();
  const until = addDays(today, 180);

  const weekly = series.filter((s) => s.status === 'published' && s.repeat === 'weekly' && (!s.endsOn || s.endsOn >= today));
  const dated = occurrences(series.filter((s) => s.repeat === 'none'), today, until);

  const days = buildDays(series, pages, today, DAYS);
  const lastDay = days[days.length - 1].date;

  // Dated events past the day-by-day calendar, grouped by month.
  const months = new Map<string, typeof dated>();
  for (const o of dated.filter((d) => d.date > lastDay)) {
    const key = o.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), o]);
  }

  const ld = dated
    .filter((o) => MARKABLE_EVENT_CATEGORIES.has(o.series.category))
    .map((o) => {
      const p = pageOf.get(o.series.pageId);
      return eventSchema({ title: o.series.title, slug: p?.slug ?? '', date: o.date, startTime: o.series.startTime, endTime: o.series.endTime, description: real(p?.summary), image: p?.heroImage ?? null, offsite: o.series.offsite, location: o.series.location, ticketUrl: o.series.ticketUrl });
    });

  return (
    <>
      <JsonLd data={breadcrumbSchema('Happening', '/dine/happening')} />
      {ld.map((d, i) => (
        <JsonLd key={i} data={d} />
      ))}
      <SiteHeader variant="overlay" />

      <section className="page-hero page-hero--short hp-hero">
        <div className="page-hero__media">
          <Image src={photos.patioNight.src} alt={photos.patioNight.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Happening</p>
          <Lines as="h1" className="display-xl" lines={['What’s on', <em key="r">at the river.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">Happy hour at the round bar, dinner nights worth planning around, holidays, and free music on the patio when summer comes back. Here’s the calendar.</p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <a href="#calendar" className="btn">The calendar</a>
            <Link href="/dine#reserve" className="btn btn--ghost">Reserve a table</Link>
          </div>
        </div>
      </section>

      <section className="section section--snow hp-days" id="calendar" aria-labelledby="calendar-h">
        <div className="container">
          <div className="hm-week__head">
            <div className="stack">
              <p className="label label--accent" data-reveal>Day by day</p>
              <Lines id="calendar-h" className="display-l" lines={[<>Every day, <em key="d">with the details.</em></>]} />
              <p className="lede" data-reveal data-reveal-delay="150">Hours, happy hour, dinner nights and everything else, starting today. Open a day to see it all.</p>
            </div>
            <div className="hm-week__legend" data-reveal data-reveal-delay="250">
              <span>{rangeLabel(days)}</span>
              {days.some((d) => d.events.some((e) => e.music)) && <span><i aria-hidden="true" />Live music</span>}
            </div>
          </div>
          <TheWeek days={days} initial={DAYS_SHOWN} />
        </div>
      </section>

      {weekly.length > 0 && (
        <section className="section section--snow hp-weekly" aria-labelledby="weekly-h">
          <div className="container">
            <div className="section-head">
              <p className="label label--accent" data-reveal>Every week</p>
              <Lines id="weekly-h" className="display-l" lines={[<>The <em key="g">regulars.</em></>]} />
            </div>
            <div className="ev-weekly">
              {weekly.map((s, i) => (
                <WeeklyCard key={s.id} s={s} page={pageOf.get(s.pageId)} next={nextDate(s, series, today)} delay={(i % 3) * 120} />
              ))}
            </div>
          </div>
        </section>
      )}

      {months.size > 0 && (
      <section className="section section--frost" id="upcoming" aria-labelledby="upcoming-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Further out</p>
            <Lines id="upcoming-h" className="display-l" lines={[<>Later this <em key="u">season.</em></>]} />
          </div>
          <div className="hp-months">
            {[...months.entries()].map(([key, list]) => (
              <div key={key} className="hp-month">
                <h3 className="hp-month__name" data-reveal>{formatDate(`${key}-01`, { month: 'long' })} <em>{key.slice(0, 4)}</em></h3>
                <div>
                  {list.map((o) => {
                    const p = pageOf.get(o.series.pageId);
                    const chip = chipFor(o.series);
                    return (
                      <Link key={`${o.series.id}-${o.date}`} href={`/dine/happening/${p?.slug ?? ''}`} className="ev-row hp-row" data-reveal="fade">
                        <span className="ev-date">
                          <b>{Number(o.date.slice(8))}</b>
                          <span>{formatDate(o.date, { weekday: 'short' })}</span>
                        </span>
                        <span className="hp-row__text">
                          <span className="ev-row__title">{o.series.title}</span>
                          <span className="ev-row__meta">
                            {[timeRange(o.series), o.series.offsite ? o.series.location : null, o.series.note].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                        <span className={chip.cls}>{chip.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      )}

      <section className="section section--snow hp-cam" aria-labelledby="cam-h">
        <div className="container split">
          <div className="stack">
            <p className="label label--accent" data-reveal>Live from the river</p>
            <Lines id="cam-h" className="display-l" lines={['The Truckee,', <em key="n">right now.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">The live river cam, straight from River Ranch. Take a look before you head over.</p>
          </div>
          <div data-reveal data-reveal-delay="150">
            <RiverCam />
          </div>
        </div>
      </section>

      <section className="section section--dark hp-concerts" aria-labelledby="scs-h">
        <div className="container split">
          <div className="stack">
            <p className="label label--accent" data-reveal>Summer on the patio</p>
            <Lines id="scs-h" className="display-l" lines={['Summer', <em key="c">Concert Series.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">Free shows on the riverside patio, bands on the stage and the Truckee running past. Music came back for good in 2025.</p>
            <div className="btn-row" data-reveal data-reveal-delay="250">
              <Link href="/dine/happening/summer-concert-series" className="btn">See the series</Link>
              <Link href="/dine/happening/summer-concert-series#play" className="btn btn--ghost">Want to play?</Link>
            </div>
          </div>
          <figure className="frame frame--wide" data-reveal="clip">
            <Image src="/photos/concerts/aerialist-over-patio-crowd.jpg" alt="An aerialist performs above the patio crowd during a summer concert" fill sizes="(max-width: 860px) 100vw, 45vw" />
          </figure>
        </div>
      </section>
    </>
  );
}

function WeeklyCard({ s, page, next, delay }: { s: EventSeries; page?: EventPage; next: string | null; delay: number }) {
  const chip = chipFor(s);
  return (
    <Link href={`/dine/happening/${page?.slug ?? ''}`} className="ev-card hp-card" data-reveal data-reveal-delay={String(delay)}>
      <span className={chip.cls} style={{ alignSelf: 'flex-start' }}>{chip.label}</span>
      <span className="ev-card__title">{s.title}</span>
      <span className="ev-card__when">{whenPhrase(s)}</span>
      {real(page?.summary) && <span className="hp-card__line">{page?.summary}</span>}
      {s.note && <span className="hp-card__note">{s.note}</span>}
      {next && <span className="hp-card__next">Next: {formatDate(next)}</span>}
    </Link>
  );
}
