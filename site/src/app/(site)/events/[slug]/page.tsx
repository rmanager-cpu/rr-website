import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApresSection } from '@/components/ApresSection';
import { CONCERT_RECAP, ConcertCollage } from '@/components/ConcertCollage';
import { SiteHeader } from '@/components/SiteHeader';
import { BookingForm } from './BookingForm';
import { business, hours } from '@/content/site';
import { breadcrumbSchema, eventSchema, JsonLd, MARKABLE_EVENT_CATEGORIES } from '@/lib/schema';
import { addDays, datesOf, formatDate, holidayDates, todayInTahoe, whenPhrase } from '@/lib/events/recurrence';
import { listPages, listSeries, pageBySlug } from '@/lib/events/store';
import type { EventPage, EventSeries } from '@/lib/events/types';

export const revalidate = 300;

export async function generateStaticParams() {
  return (await listPages()).map((p) => ({ slug: p.slug }));
}

/** A page with no words yet (e.g. a holiday's placeholder) stays out of Google until it has some. */
const isEmpty = (p: EventPage) => !p.body?.trim() && !p.summary?.trim() && p.layout === 'standard';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await pageBySlug(params.slug);
  if (!page) return {};
  return {
    title: page.slug === 'summer-concert-series' ? 'Summer Concert Series: Free Music on the River' : page.title,
    description: page.summary ?? `${page.title} at River Ranch Lodge & Restaurant in Tahoe City.`,
    alternates: { canonical: `/events/${page.slug}` },
    ...(page.heroImage ? { openGraph: { images: [page.heroImage] } } : {}),
    ...(isEmpty(page) ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function EventDetail({ params }: { params: { slug: string } }) {
  const page = await pageBySlug(params.slug);
  if (!page) notFound();
  const all = await listSeries();
  const mine = all.filter((s) => s.pageId === page.id && s.status === 'published');
  const today = todayInTahoe();
  const hol = holidayDates(all);
  const upcoming = mine.flatMap((s) => datesOf(s, today, addDays(today, 120), hol).map((d) => ({ s, d }))).sort((a, b) => a.d.localeCompare(b.d));

  const ld = upcoming
    .filter(({ s }) => MARKABLE_EVENT_CATEGORIES.has(s.category))
    .slice(0, 6)
    .map(({ s, d }) => eventSchema({ title: s.title, slug: page.slug, date: d, startTime: s.startTime, endTime: s.endTime, description: page.summary, image: page.heroImage, offsite: s.offsite, location: s.location, ticketUrl: s.ticketUrl }));

  return (
    <>
      <JsonLd data={breadcrumbSchema(page.title, `/events/${page.slug}`)} />
      {ld.map((d, i) => (
        <JsonLd key={i} data={d} />
      ))}
      {page.layout === 'collage' ? <ConcertPage page={page} /> : page.layout === 'apres' ? <HappyHourPage page={page} mine={mine} /> : <StandardPage page={page} mine={mine} upcoming={upcoming} />}
    </>
  );
}

function When({ mine, upcoming, dark = false }: { mine: EventSeries[]; upcoming: { s: EventSeries; d: string }[]; dark?: boolean }) {
  if (!mine.length) return null;
  return (
    <div className="stack" style={{ gap: 14 }}>
      {mine.map((s) => (
        <p key={s.id} className="serif" style={{ margin: 0, fontSize: 'clamp(24px, 2.6vw, 34px)', lineHeight: 1.15, color: dark ? 'var(--cream)' : undefined }}>
          {whenPhrase(s)}
        </p>
      ))}
      {mine.some((s) => s.repeat === 'weekly') && upcoming.length > 0 && (
        <ul className="ev-dates" aria-label="Next dates">
          {upcoming.slice(0, 10).map(({ d }) => (
            <li key={d}>{formatDate(d)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StandardPage({ page, mine, upcoming }: { page: EventPage; mine: EventSeries[]; upcoming: { s: EventSeries; d: string }[] }) {
  const s = mine[0];
  const flyer = page.slug === 'zombie-karaoke' ? { src: '/photos/zombie-karaoke-flyer.jpg', w: 494, h: 640, alt: 'Zombie Karaoke flyer: 9 PM to midnight, $99 rooms and 50% off breakfast' } : null;
  return (
    <>
      <SiteHeader />
      <section className="section">
        <div className="container media-row" style={{ gap: 48, alignItems: 'flex-start' }}>
          <div className="grow stack" style={{ gap: 24 }}>
            <Link href="/events" className="arrow-link" style={{ fontSize: 12 }}>← All events</Link>
            <span className="eyebrow">{s?.offsite ? 'Off-site' : s?.category === 'holiday' ? 'Holiday' : 'At River Ranch'}</span>
            <h1 className="slash h-l">{page.title}</h1>
            <When mine={mine} upcoming={upcoming} />
            {s?.offsite && s.location && <p className="lede"><strong>Where:</strong> {s.location} (not at River Ranch)</p>}
            {page.summary && <p className="lede">{page.summary}</p>}
            {page.body?.trim() ? (
              <div className="prose">{page.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}</div>
            ) : (
              <p className="lede">More details coming soon.</p>
            )}
            <div className="btn-row">
              {s?.ticketUrl && <a href={s.ticketUrl} className="btn btn--amber" rel="noopener">Get tickets</a>}
              {!s?.offsite && <a href={business.links.reserveTable} className="btn btn--navy" rel="noopener">Reserve a table</a>}
            </div>
          </div>
          <div className="side">
            {flyer ? (
              <Image src={flyer.src} alt={flyer.alt} width={flyer.w} height={flyer.h} sizes="(max-width: 900px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto', boxShadow: '0 24px 50px -20px rgba(0,0,0,.5)' }} />
            ) : page.heroImage ? (
              <Image src={page.heroImage} alt={`${page.title} at River Ranch`} width={1800} height={1200} sizes="(max-width: 900px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto' }} />
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

function HappyHourPage({ page, mine }: { page: EventPage; mine: EventSeries[] }) {
  return (
    <>
      <div style={{ background: 'var(--night)' }}>
        <SiteHeader variant="overlay" />
      </div>
      <h1 className="sr-only">{page.title} at River Ranch, Tahoe City</h1>
      <ApresSection
        eyebrow="Happy hour · Monday–Friday"
        title="Happy hour at the River Ranch round bar"
        line={`Monday to Friday, ${hours.happyHour.time}.`}
        detail={page.body ?? ''}
        cta={{ href: '/dine#happy-hour', label: 'Happy hour menu' }}
      />
      <section className="section on-night" style={{ paddingTop: 0 }}>
        <div className="container stack" style={{ gap: 18 }}>
          <span className="eyebrow">Good to know</span>
          {mine.map((s) => (
            <p key={s.id} className="lede" style={{ maxWidth: '60ch' }}>
              {whenPhrase(s)}. {s.note}
            </p>
          ))}
        </div>
      </section>
    </>
  );
}

/**
 * The recap video. Set this once the video is ready (file in public/video/, plus a poster frame);
 * while it's null the slot isn't shown. When set, the page also tells Google about it (VideoObject).
 */
const RECAP_VIDEO: { src: string; poster: string; title: string; uploadDate: string } | null = null;

function ConcertPage({ page }: { page: EventPage }) {
  // A poster wall: the collage fills the whole page, and the words and the form are pinned over it.
  return (
    <div className="concert-hero">
      {RECAP_VIDEO && (
        <JsonLd data={{ "@context": "https://schema.org", "@type": "VideoObject", name: RECAP_VIDEO.title, description: page.summary ?? "Summer Concert Series at River Ranch", thumbnailUrl: RECAP_VIDEO.poster, contentUrl: RECAP_VIDEO.src, uploadDate: RECAP_VIDEO.uploadDate }} />
      )}
      <SiteHeader variant="overlay" />
      <div className="cwall">
        <div className="cwall__collage">
          <ConcertCollage />
        </div>
        <div className="cwall__content container">
          <section className="cwall__card cwall__card--a stack" style={{ gap: 22 }}>
            <span className="eyebrow eyebrow--amber">Free music on the river</span>
            <h1 className="slash concert-title">
              Summer Concert<span>Series.</span>
            </h1>
            <div className="mission">
              <p>Every summer we turn the patio into a stage. Local bands and touring acts, string lights in the pines, an aerialist over the crowd, and the Truckee running right behind it all.</p>
              <p>The shows are free, because music on the river should be for everybody: locals, ski bums turned river rats, families, and whoever floated in that afternoon.</p>
            </div>
            <p className="thanks-line">
              Made possible by{" "}
              <a href="https://www.tincupwhiskey.com" rel="noopener">TINCUP Whiskey</a>,{" "}
              <a href="https://www.diageo.com" rel="noopener">Diageo</a> and the{" "}
              <a href="https://www.northtahoechamber.com" rel="noopener">North Tahoe Chamber</a>. Thank you.
            </p>
          </section>

          {RECAP_VIDEO && (
            <section className="cwall__card cwall__card--b" aria-label="Video recap">
              <video className="concert-video" src={RECAP_VIDEO.src} poster={RECAP_VIDEO.poster} controls playsInline preload="none" title={RECAP_VIDEO.title} />
            </section>
          )}

          <section className="cwall__card cwall__card--c" aria-labelledby="play-h" id="play">
            <div className="media-row" style={{ gap: 32, alignItems: "flex-start" }}>
              <div className="grow stack" style={{ gap: 18, flexBasis: 300 }}>
                <span className="eyebrow eyebrow--amber">Bands &amp; artists</span>
                <h2 id="play-h" className="slash" style={{ fontSize: "clamp(42px, 5vw, 80px)", lineHeight: 0.95, color: "var(--cream)" }}>Everybody wants to play the river.</h2>
                <p className="lede">We hear from far more bands than we have summer nights, from Tahoe locals to acts on tour up and down the West Coast. If you want a spot on the patio stage, send us your music. We listen to every request and book the ones that fit the season.</p>
              </div>
              <div className="side" style={{ flexBasis: 380 }}>
                <BookingForm />
              </div>
            </div>
          </section>

          <section className="cwall__card cwall__card--d" aria-labelledby="recap-h">
            <div className="stack" style={{ gap: 26 }}>
              <h2 id="recap-h" className="serif h-m">The recap</h2>
              <div className="recap">
                {CONCERT_RECAP.map((r) => (
                  <div key={r.year}>
                    <h3>{r.year}</h3>
                    <ul>{r.shows.map((x) => <li key={x}>{x}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="btn-row">
                <a href={business.social.instagram} className="btn btn--amber" rel="noopener">Follow for the lineup</a>
                <Link href="/stay" className="btn btn--ghost-cream">Stay the night</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
