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
import { chipFor } from '../chips';
import '../happening.css';

export const revalidate = 300;

export async function generateStaticParams() {
  return (await listPages()).map((p) => ({ slug: p.slug }));
}

/** Placeholder text left in the events store never reaches the page or Google. */
const real = (s: string | null | undefined) => (s && s.trim() && !/lorem ipsum/i.test(s) ? s : null);

/** A page with no words yet (e.g. a holiday's placeholder) stays out of Google until it has some. */
const isEmpty = (p: EventPage) => !real(p.body) && !real(p.summary) && p.layout === 'standard';

const CONCERT_DESCRIPTION = 'Free live music on the riverside patio at River Ranch in Tahoe City, all summer long. The lineup, the recap and how to play.';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await pageBySlug(params.slug);
  if (!page) return {};
  const concert = page.slug === 'summer-concert-series';
  return {
    title: concert ? 'Summer Concert Series: Free Music on the River' : page.title,
    description: real(page.summary) ?? (concert ? CONCERT_DESCRIPTION : `${page.title} at River Ranch Lodge & Restaurant in Tahoe City.`),
    alternates: { canonical: `/dine/happening/${page.slug}` },
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
    .map(({ s, d }) => eventSchema({ title: s.title, slug: page.slug, date: d, startTime: s.startTime, endTime: s.endTime, description: real(page.summary), image: page.heroImage, offsite: s.offsite, location: s.location, ticketUrl: s.ticketUrl }));

  return (
    <>
      <JsonLd data={breadcrumbSchema(page.title, `/dine/happening/${page.slug}`)} />
      {ld.map((d, i) => (
        <JsonLd key={i} data={d} />
      ))}
      {page.layout === 'collage' ? <ConcertPage page={page} /> : page.layout === 'apres' ? <HappyHourPage page={page} mine={mine} /> : <StandardPage page={page} mine={mine} upcoming={upcoming} />}
    </>
  );
}

function When({ mine, upcoming }: { mine: EventSeries[]; upcoming: { s: EventSeries; d: string }[] }) {
  if (!mine.length) return null;
  return (
    <div className="stack" style={{ gap: 14 }}>
      {mine.map((s) => (
        <p key={s.id} className="hp-event__when">{whenPhrase(s)}</p>
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
  const chip = s ? chipFor(s) : null;
  const summary = real(page.summary);
  const body = real(page.body);
  const hasSide = Boolean(flyer || page.heroImage);
  return (
    <>
      <SiteHeader />
      <section className="section section--snow hp-event">
        <div className={hasSide ? 'container hp-event__grid' : 'container container--narrow'}>
          <div className="stack">
            <Link href="/dine/happening" className="link-arrow hp-back" data-reveal>
              Everything happening
            </Link>
            {chip && (
              <div className="chip-row" data-reveal>
                <span className={chip.cls}>{chip.label}</span>
                {!s.offsite && <span className="chip chip--plain">At River Ranch</span>}
              </div>
            )}
            <h1 className="display-l" data-reveal data-reveal-delay="120">{page.title}</h1>
            <div data-reveal data-reveal-delay="200">
              <When mine={mine} upcoming={upcoming} />
            </div>
            {s?.offsite && s.location && (
              <p className="lede" data-reveal data-reveal-delay="200"><strong>Where:</strong> {s.location} (not at River Ranch)</p>
            )}
            {summary && <p className="lede" data-reveal data-reveal-delay="200">{summary}</p>}
            {body ? (
              <div className="prose" data-reveal data-reveal-delay="300">{body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}</div>
            ) : (
              <p className="lede" data-reveal data-reveal-delay="300">More details coming soon.</p>
            )}
            {(s?.ticketUrl || !s?.offsite) && (
              <div className="btn-row" data-reveal data-reveal-delay="300">
                {s?.ticketUrl && <a href={s.ticketUrl} className="btn" rel="noopener">Get tickets</a>}
                {!s?.offsite && <Link href="/dine#reserve" className={s?.ticketUrl ? 'btn btn--ghost' : 'btn'}>Reserve a table</Link>}
                {!s?.offsite && <a href={`tel:${business.phoneE164}`} className="btn btn--ghost">{business.phone}</a>}
              </div>
            )}
            {page.links.length > 0 && (
              <ul className="hp-event__links" data-reveal>
                {page.links.map((l) => (
                  <li key={l.url}><a href={l.url} className="link-arrow" rel="noopener">{l.label}</a></li>
                ))}
              </ul>
            )}
          </div>
          {hasSide && (
            <div className="hp-event__side">
              {flyer ? (
                <figure className="hp-event__flyer" style={{ margin: 0 }} data-reveal data-reveal-delay="120">
                  <Image src={flyer.src} alt={flyer.alt} width={flyer.w} height={flyer.h} priority sizes="(max-width: 860px) 100vw, 440px" />
                </figure>
              ) : page.heroImage ? (
                <figure className="frame frame--tall" data-reveal="clip">
                  <Image src={page.heroImage} alt={`${page.title} at River Ranch`} fill priority sizes="(max-width: 860px) 100vw, 440px" />
                </figure>
              ) : null}
              {page.photos.length > 1 && (
                <div className="hp-event__thumbs">
                  {page.photos.slice(1).map((src, i) => (
                    <figure key={src} className="frame" data-reveal data-reveal-delay={String(((i % 2) + 1) * 120)}>
                      <Image src={src} alt={`${page.title} at River Ranch, photo ${i + 2}`} fill sizes="(max-width: 860px) 50vw, 220px" />
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function HappyHourPage({ page, mine }: { page: EventPage; mine: EventSeries[] }) {
  return (
    <>
      <SiteHeader variant="overlay" />
      <h1 className="sr-only">{page.title} at River Ranch, Tahoe City</h1>
      <ApresSection
        first
        eyebrow="Happy hour · Monday to Friday"
        title="Happy hour at the River Ranch round bar"
        line={`Monday to Friday, ${hours.happyHour.time}.`}
        detail={real(page.body) ?? 'Come in off the mountain and thaw. Dine-in at the round bar, and not on holidays.'}
        cta={{ href: '/dine/menus/happy-hour', label: 'Happy hour menu' }}
      />
      {mine.length > 0 && (
        <section className="section section--ember hp-know">
          <div className="container stack">
            <p className="label label--accent" data-reveal>Good to know</p>
            <ul className="fl-facts" style={{ maxWidth: 720 }} data-reveal data-reveal-delay="120">
              {mine.map((s) => (
                <li key={s.id}>
                  <span>{whenPhrase(s)}</span>
                  <span>{s.note ?? hours.happyHour.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
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
        <JsonLd data={{ "@context": "https://schema.org", "@type": "VideoObject", name: RECAP_VIDEO.title, description: real(page.summary) ?? CONCERT_DESCRIPTION, thumbnailUrl: RECAP_VIDEO.poster, contentUrl: RECAP_VIDEO.src, uploadDate: RECAP_VIDEO.uploadDate }} />
      )}
      <SiteHeader variant="overlay" />
      <div className="cwall" style={{ paddingTop: 'calc(var(--header-h) + 54px)' }}>
        <div className="cwall__collage">
          <ConcertCollage />
        </div>
        <div className="cwall__content container">
          <section className="cwall__card cwall__card--a stack" style={{ gap: 22 }}>
            <span className="label label--accent">Free music on the river</span>
            <h1 className="slash concert-title">
              Summer Concert<span>Series.</span>
            </h1>
            <div className="mission">
              <p>Free shows on the riverside patio, all summer. A band on the stage, the Truckee running past, and nobody checking tickets at the gate.</p>
              <p>Music came back to River Ranch for good in 2025. Grab a drink, find a spot by the rail, stay for the encore.</p>
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
                <span className="label label--accent">Bands &amp; artists</span>
                <h2 id="play-h" className="display-l" style={{ color: 'var(--cream)' }}>Want to play <em>the river?</em></h2>
                <p className="lede">Send us your band, your links and the nights you’re free, and we’ll give it a listen.</p>
              </div>
              <div className="side" style={{ flexBasis: 380 }}>
                <BookingForm />
              </div>
            </div>
          </section>

          <section className="cwall__card cwall__card--d" aria-labelledby="recap-h">
            <div className="stack" style={{ gap: 26 }}>
              <h2 id="recap-h" className="display-m">The <em>recap</em></h2>
              <div className="recap">
                {CONCERT_RECAP.map((r) => (
                  <div key={r.year}>
                    <h3>{r.year}</h3>
                    <ul>{r.shows.map((x) => <li key={x}>{x}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="btn-row">
                <a href={business.social.instagram} className="btn" rel="noopener">Follow for the lineup</a>
                <Link href="/stay" className="btn btn--ghost-light">Stay the night</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
