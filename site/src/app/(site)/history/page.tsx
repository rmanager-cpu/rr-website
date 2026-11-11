import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { WallStage } from './WallStage';
import { YearsReel } from './YearsReel';
import './history.css';

export const metadata: Metadata = {
  title: 'Our History: A Century on the Truckee River',
  description:
    'River Ranch opened in 1964 on the site of the old Deer Park Lodge on the Truckee River. Read the short version, then walk along The Wall: the old photos, clippings and menus by the host stand.',
  alternates: { canonical: '/history' },
};

// The years that slide by below the wall: each one comes straight from the approved paragraph.
const YEARS = [
  { year: '1914', tag: 'Before us', line: 'A poet calls Deer Park “where the joy-hunters gather.”' },
  { year: '1964', tag: 'Doors open', line: 'River Ranch opens. Within a year, Time has noticed.' },
  { year: '1997', tag: 'On stage', line: 'Leftover Salmon and the String Cheese Incident are playing here.' },
  { year: '2003', tag: 'On stage', line: 'Umphrey’s McGee comes through.' },
  { year: '2012', tag: 'Summer', line: 'The Summer Concert Series is packing the place.' },
  { year: '2025', tag: 'Back for good', line: 'The music comes back for good, thanks to our friends at Go Tahoe North and Casamigos Tequila.' },
];

// How solid each line is: "History facts" in docs/HISTORY-WALL.md. Don't state 1888 as fact, and don't
// say Renegade started the concert series (it's older). Management wants this kept to six sentences at
// most, with the live music connection in it.
// The page opens straight onto The Wall (the wall app, history-wall/, full screen under the header);
// the intro and this paragraph sit on a placard beside it. Below the wall, in the Fireside look: the years
// reel (dark), a few frames off the wall (snow white) and the closing (dark).
export default function HistoryPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('History', '/history')} />
      <SiteHeader />

      <WallStage
        wallUrl={business.links.theWall}
        src={`${business.links.theWall}/?embed`}
        intro={
          <>
            <p className="label label--accent">History</p>
            <h1 id="hx-title" className="hx-card__title">Sixty-some years of <em>good nights.</em></h1>
            <p className="hx-card__line">They all end up on The Wall. Drag or swipe to walk along it, and tap any photo to see it up close.</p>
          </>
        }
        story={
          <p>River Ranch opened in 1964 on the site of the old Deer Park Lodge, heir (depending on who’s pouring) to a Deer Park resort a poet called “where the joy-hunters gather” back in 1914. Within a year Time called it the place to stay for “sophisticated young San Francisco marrieds,” and the après drink was a tequila toddy called the Hot Damn. It has long been where the mountain comes down to party: Wild Winter Wednesdays, the SnowFest snow sculpture contest, and summer rafters floating straight onto the patio. By 1997 Leftover Salmon and the String Cheese Incident were playing here, Umphrey’s McGee came through in 2003, and by 2012 Renegade Productions had the Summer Concert Series packing the place. The pandemic hushed it, but the music came back for good in 2025, with thanks to our friends at <a href="https://laketahoetravel.com/" rel="noopener">Go Tahoe North</a> and Casamigos Tequila. Now it’s elegant weddings, rowdy summer shows and private parties right on the river, and the locals are saying it: the Ranch is back.</p>
        }
      />

      {/* The short version: the years slide by as you scroll (Fireside's reel). */}
      <YearsReel
        years={YEARS}
        head={
          <>
            <p className="label label--accent" data-reveal>The short version</p>
            <Lines id="hx-years-h" className="display-m" lines={[<>A poet, a magazine, a tequila toddy <em>and a lot of loud bands.</em></>]} />
          </>
        }
      />

      {/* A few pieces off the wall, up close, on snow white. */}
      <section className="section section--snow" aria-labelledby="hx-pieces-h">
        <div className="container split split--top hx-off">
          <div className="hx-off__head">
            <p className="label label--accent" data-reveal>Off the wall</p>
            <Lines id="hx-pieces-h" className="display-l" lines={['A few frames,', <em key="e">up close.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">The day it all started, and a party twenty-some years later. Find the rest on The Wall.</p>
            <div className="chip-row" data-reveal data-reveal-delay="250">
              <span className="chip chip--plain">Opened 1964</span>
              <span className="chip chip--plain">On the Truckee</span>
              <span className="chip chip--plain">{business.rooms} rooms</span>
            </div>
            <p data-reveal data-reveal-delay="300"><a className="link-arrow" href="#the-wall">Back to The Wall</a></p>
          </div>
          <div className="hx-pieces" data-reveal data-reveal-delay="120">
            <figure className="hx-piece">
              <div className="frame frame--tall">
                <Image src="/photos/history-grand-opening-ad.jpg" alt="Newspaper ad announcing the grand opening of River Ranch, Sunday, Nov. 22, at the entrance to Alpine Meadows" fill sizes="(max-width: 860px) 50vw, 340px" style={{ objectPosition: '50% 40%' }} />
              </div>
              <figcaption>The grand opening ad, “Sunday, Nov. 22.”</figcaption>
            </figure>
            <figure className="hx-piece">
              <div className="frame frame--tall">
                <Image src="/photos/history-1992-anniversary-poster.jpg" alt="1992 River Ranch Lodge anniversary party poster: Be there or be square, November 20, 1992, celebrating 20 years of Tahoe tradition" fill sizes="(max-width: 860px) 50vw, 340px" />
              </div>
              <figcaption>“Be there or be square”: the anniversary party, November 20, 1992.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="section section--dark section--tight hx-outro">
        <div className="container container--narrow">
          <p className="label label--accent" data-reveal>Your turn</p>
          <Lines className="display-l" lines={['The next photo', <em key="e">could be yours.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="150">Stay the night, grab a stool at the round bar, or throw the party people talk about.</p>
          <div className="btn-row" data-reveal data-reveal-delay="250">
            <Link className="btn" href={business.links.bookRoom}>Book a room</Link>
            <Link className="btn btn--ghost" href="/dine/happening">See what’s on</Link>
            <Link className="btn btn--ghost" href="/celebrate/plan">Plan an event</Link>
          </div>
        </div>
      </section>
    </>
  );
}
