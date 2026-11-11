import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HomeHero } from '@/components/home/HomeHero';
import { buildComingUp } from '@/components/home/comingUp';
import { spoken } from '@/components/calendar/days';
import { Lines } from '@/components/fl/Lines';
import { RiverCam } from '@/components/RiverCam';
import { SiteHeader } from '@/components/SiteHeader';
import { photos, homePhotos } from '@/content/photos';
import { hours, lodging } from '@/content/site';
import { todayInTahoe } from '@/lib/events/recurrence';
import { listPages, listSeries } from '@/lib/events/store';
import '@/components/home/home-fl.css';

// The calendar reads the live events, so the page refreshes every five minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const SHORT_DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
/** ['Monday', …, 'Friday'] -> 'Mon to Fri'; ['Saturday', 'Sunday'] -> 'Sat and Sun'. */
function dayspan(list: readonly string[]): string {
  if (list.length === 7) return 'Nightly';
  const idx = list.map((d) => FULL_DAY.indexOf(d));
  const a = SHORT_DAY[idx[0]];
  const b = SHORT_DAY[idx[idx.length - 1]];
  return idx.length === 2 ? `${a} and ${b}` : `${a} to ${b}`;
}

export default async function Home() {
  const [series, pages] = await Promise.all([listSeries(), listPages()]);
  const next = buildComingUp(series, pages, todayInTahoe());

  return (
    <>
      <SiteHeader variant="overlay" solidAfter={1.4} />
      <noscript>
        <style>{'.hm-hero__actions{opacity:1!important;transform:none!important;pointer-events:auto!important}'}</style>
      </noscript>

      {/* 1. Night into first light (the First Light hero; its morning fades into the Palisades wash) */}
      <HomeHero />

      {/* 2. Coming up: the next big events staff picked in the editor, then the river cam */}
      <section className="section hm-next" id="today" aria-labelledby="today-h">
        <div className="container">
          <div className="hm-next__head">
            <div className="stack">
              <p className="label label--accent" data-reveal>Coming up</p>
              <Lines as="h2" id="today-h" className="display-xl" lines={[<>Next on <em>the river.</em></>]} />
            </div>
            <Link className="link-arrow" href="/dine/happening#calendar" data-reveal data-reveal-delay="200">The full calendar</Link>
          </div>

          {next.length > 0 ? (
            <ul className="hm-next__grid">
              {next.map((e, i) => {
                const body = (
                  <>
                    <span className="frame hm-next__photo">
                      <Image src={e.photo.src} alt={e.photo.alt} fill sizes="(max-width: 860px) 100vw, 33vw" />
                      <span className="hm-next__date">
                        <b>{e.num}</b>
                        <span>{e.month}</span>
                      </span>
                    </span>
                    <span className="hm-next__body">
                      <span className="label">{e.weekday}{e.when ? ` · ${e.when}` : ''}</span>
                      <span className="hm-next__title">{e.title}</span>
                      {e.line && <span className="hm-next__line">{e.line}</span>}
                      <span className={`chip chip--${e.chip}`}>{e.chipLabel}</span>
                    </span>
                  </>
                );
                return (
                  <li key={e.key} data-reveal data-reveal-delay={i ? String(i * 120) : undefined}>
                    {e.href ? <Link className="hm-next__card" href={e.href}>{body}</Link> : <div className="hm-next__card">{body}</div>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="lede" data-reveal>New events are on the way. Happy hour is weekdays, and dinner is every night.</p>
          )}

          <div className="hm-cam" id="river-cam">
            <div className="hm-cam__head">
              <div className="stack">
                <p className="label" data-reveal>Truckee River, out back</p>
                <Lines as="h3" className="display-l" lines={[<>The river, <em>right now.</em></>]} />
              </div>
              <ul className="hm-hours" data-reveal data-reveal-delay="150" aria-label="Hours">
                {[hours.dinner, hours.happyHour, hours.breakfast].map((h) => (
                  <li key={h.label}>
                    <span>{h.label}</span>
                    <span>{dayspan(h.dayList)}, {spoken(h.time)}</span>
                  </li>
                ))}
                <li>
                  <span>Lodge</span>
                  <span>Check-in {lodging.checkIn}, check-out {lodging.checkOut}</span>
                </li>
              </ul>
            </div>
            <div data-reveal>
              <RiverCam />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three doors */}
      <section className="section--dark hm-doors" id="doors" aria-labelledby="doors-h">
        <div className="container hm-doors__head">
          <p className="label label--accent" data-reveal>Come in</p>
          <Lines as="h2" id="doors-h" className="display-l" lines={[<>Three ways <em>through the door.</em></>]} />
        </div>
        <div className="hm-doors__row">
          <Link className="hm-door hm-door--stay" href="/stay">
            <Image src={homePhotos.skiRoom.src} alt={homePhotos.skiRoom.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
            <span className="hm-door__body">
              <span className="label hm-door__num">19 rooms</span>
              <span className="hm-door__word">Stay</span>
              <span className="hm-door__line">Most of them look at the river. The bar is downstairs.</span>
              <span className="link-arrow hm-door__go">See the rooms</span>
            </span>
          </Link>
          <Link className="hm-door" href="/dine">
            <Image src={homePhotos.dining.src} alt={homePhotos.dining.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
            <span className="hm-door__body">
              <span className="label hm-door__num">Dinner nightly</span>
              <span className="hm-door__word">Dine</span>
              <span className="hm-door__line">Dinner every night, {spoken(hours.dinner.time)}. Start at the round bar.</span>
              <span className="link-arrow hm-door__go">See the restaurant</span>
            </span>
          </Link>
          <Link className="hm-door" href="/celebrate">
            <Image src={homePhotos.cake.src} alt={homePhotos.cake.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
            <span className="hm-door__body">
              <span className="label hm-door__num">Weddings and parties</span>
              <span className="hm-door__word">Celebrate</span>
              <span className="hm-door__line">Weddings, private dinners, loud toasts. Right on the river.</span>
              <span className="link-arrow hm-door__go">Plan yours</span>
            </span>
          </Link>
        </div>
      </section>

      {/* 4. The wine */}
      <section className="section section--ember hm-wine" id="wine" aria-labelledby="wine-h">
        <div className="container split">
          <figure className="frame frame--tall" data-reveal="clip">
            <Image src={photos.serverWine.src} alt={photos.serverWine.alt} fill sizes="(max-width: 860px) 100vw, 520px" />
          </figure>
          <div className="stack">
            <p className="label label--accent" data-reveal>The wine</p>
            <Lines as="h2" id="wine-h" className="display-l" lines={['Johanson', <em>Family Wine.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">The owners&rsquo; own label: an estate grown Napa Cab, poured right here. Ask for it with dinner.</p>
            <p data-reveal data-reveal-delay="250">
              <Link className="link-arrow" href="/dine/wine">Meet the wine</Link>
            </p>
          </div>
        </div>
      </section>

      {/* 5. The Wall */}
      <section className="hm-wall grain" id="wall" aria-labelledby="wall-h">
        <div className="hm-wall__media">
          <Image src={photos.theWall.src} alt={photos.theWall.alt} fill sizes="100vw" data-parallax="0.12" />
        </div>
        <div className="container stack">
          <p className="label label--accent" data-reveal>Since 1964</p>
          <Lines as="h2" id="wall-h" className="display-l" lines={['Every good night', <>ends up on <em>The Wall.</em></>]} />
          <p className="lede" data-reveal data-reveal-delay="150">Sixty years of snow days, loud bands and a tequila toddy called the Hot Damn. Go have a look.</p>
          <p data-reveal data-reveal-delay="250">
            <Link className="btn" href="/history">Walk The Wall</Link>
          </p>
        </div>
      </section>
    </>
  );
}
