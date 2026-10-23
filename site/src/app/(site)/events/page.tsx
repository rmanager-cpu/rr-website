import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { breadcrumbSchema, eventSchema, JsonLd, MARKABLE_EVENT_CATEGORIES } from '@/lib/schema';
import { addDays, formatDate, nextDate, occurrences, timeRange, todayInTahoe, whenPhrase } from '@/lib/events/recurrence';
import { listPages, listSeries } from '@/lib/events/store';
import type { EventPage, EventSeries } from '@/lib/events/types';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Events, Live Music & Happy Hour in Tahoe City',
  description:
    'What’s on at River Ranch in Tahoe City: happy hour Monday to Friday 3–5 PM, Prime Rib Thursdays, live music on the riverside patio, holiday dinners and community events.',
  alternates: { canonical: '/events' },
};

export default async function EventsPage() {
  const [series, pages] = await Promise.all([listSeries(), listPages()]);
  const pageOf = new Map(pages.map((p) => [p.id, p]));
  const today = todayInTahoe();
  const until = addDays(today, 180);

  const weekly = series.filter((s) => s.status === 'published' && s.repeat === 'weekly' && (!s.endsOn || s.endsOn >= today));
  const dated = occurrences(series.filter((s) => s.repeat === 'none'), today, until);

  // Group the dated events by month.
  const months = new Map<string, typeof dated>();
  for (const o of dated) {
    const key = o.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), o]);
  }

  const ld = dated
    .filter((o) => MARKABLE_EVENT_CATEGORIES.has(o.series.category))
    .map((o) => {
      const p = pageOf.get(o.series.pageId);
      return eventSchema({ title: o.series.title, slug: p?.slug ?? '', date: o.date, startTime: o.series.startTime, endTime: o.series.endTime, description: p?.summary ?? null, image: p?.heroImage ?? null, offsite: o.series.offsite, location: o.series.location, ticketUrl: o.series.ticketUrl });
    });

  return (
    <>
      <JsonLd data={breadcrumbSchema('Events', '/events')} />
      {ld.map((d, i) => (
        <JsonLd key={i} data={d} />
      ))}
      <SiteHeader />

      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="container stack" style={{ gap: 22 }}>
          <span className="eyebrow">Events</span>
          <h1 className="slash h-l">What&apos;s on at River Ranch.</h1>
          <p className="lede">Happy hour, Prime Rib Thursdays, live music on the patio and the holidays, on the Truckee River in Tahoe City.</p>
        </div>
      </section>

      {weekly.length > 0 && (
        <section className="section bg-frost" aria-labelledby="weekly-h" style={{ paddingBlock: 64 }}>
          <div className="container stack" style={{ gap: 24 }}>
            <h2 id="weekly-h" className="serif h-s">Every week</h2>
            <div className="ev-weekly">
              {weekly.map((s) => (
                <WeeklyCard key={s.id} s={s} page={pageOf.get(s.pageId)} next={nextDate(s, series, today)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="upcoming-h">
        <div className="container stack" style={{ gap: 36 }}>
          <h2 id="upcoming-h" className="serif h-s">Coming up</h2>
          {months.size === 0 && <p className="lede">New events are on the way. Check back soon.</p>}
          {[...months.entries()].map(([key, list]) => (
            <div key={key} className="ev-month">
              <h3>{formatDate(`${key}-01`, { month: 'long', year: 'numeric' })}</h3>
              {list.map((o) => {
                const p = pageOf.get(o.series.pageId);
                return (
                  <Link key={`${o.series.id}-${o.date}`} href={`/events/${p?.slug ?? ''}`} className="ev-row">
                    <span className="ev-date">
                      <b>{Number(o.date.slice(8))}</b>
                      <span>{formatDate(o.date, { weekday: 'short' })}</span>
                    </span>
                    <span className="stack" style={{ gap: 2 }}>
                      <span className="ev-row__title">{o.series.title}</span>
                      <span className="ev-row__meta">
                        {[timeRange(o.series), o.series.offsite ? o.series.location : null, o.series.note].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    {o.series.category === 'holiday' ? (
                      <span className="ev-chip ev-chip--hol">Holiday</span>
                    ) : o.series.offsite ? (
                      <span className="ev-chip ev-chip--off">Off-site</span>
                    ) : (
                      <span className="ev-chip">At River Ranch</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="concert-hero" aria-labelledby="scs-h">
        <Link href="/events/summer-concert-series" className="container next-door" style={{ color: 'var(--cream)' }}>
          <span className="stack" style={{ gap: 14 }}>
            <span className="eyebrow eyebrow--amber">Summer on the patio</span>
            <span id="scs-h" className="slash" style={{ fontSize: 'clamp(44px, 6vw, 88px)', lineHeight: 0.95 }}>Summer Concert Series</span>
            <span className="lede">Free music on the river. See the recap and stay tuned for next summer’s lineup.</span>
          </span>
          <Image src="/photos/concerts/aerialist-over-patio-crowd.jpg" alt="An aerialist performs above the patio crowd during a summer concert" width={1277} height={720} sizes="460px" className="rounded" style={{ width: 'min(460px, 100%)', height: 'auto' }} />
        </Link>
      </section>
    </>
  );
}

function WeeklyCard({ s, page, next }: { s: EventSeries; page?: EventPage; next: string | null }) {
  return (
    <Link href={`/events/${page?.slug ?? ''}`} className="ev-card">
      <span className="ev-card__title">{s.title}</span>
      <span className="ev-card__when">{whenPhrase(s)}</span>
      {page?.summary && <span className="muted" style={{ fontSize: 15 }}>{page.summary}</span>}
      {s.note && <span className="muted" style={{ fontSize: 14 }}>{s.note}</span>}
      {next && <span style={{ fontSize: 14, fontWeight: 600 }}>Next: {formatDate(next)}</span>}
    </Link>
  );
}
