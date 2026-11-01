import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Our History: Decades of Tahoe Tradition',
  description:
    'The story of River Ranch Lodge on the Truckee River, told through the wall of old photos by the host stand: skiers, racers, regulars and decades of Tahoe tradition.',
  alternates: { canonical: '/history' },
};

// Only facts we can stand behind: what's printed on the wall's own artifacts. The full history gets
// written as the stories come in through The Wall.
export default function HistoryPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('History', '/history')} />
      <SiteHeader />
      <section className="section">
        <div className="container stack" style={{ gap: 26, maxWidth: 980 }}>
          <span className="eyebrow">Our history</span>
          <h1 className="slash h-l">{L.head}</h1>
          <div className="prose">
            <p>{L.para}</p>
            <p>That wall, by the host stand, holds dozens of old photographs, clippings and menus: the grand opening announcement, a 1992 party poster celebrating “20 years of Tahoe tradition” with a hundred regulars’ nicknames, signed photos from ski racers, and black-tie nights on the mountain.</p>
            <p>{L.para2}</p>
          </div>
          <div className="btn-row">
            <a href="#the-wall" className="btn btn--amber">Explore The Wall</a>
          </div>
        </div>
      </section>
      {/* The Wall, embedded: the interactive photo wall (its own app, history-wall/), loaded only when
          the visitor scrolls near it so it never slows the page down. */}
      <section className="section on-night" id="the-wall" aria-labelledby="wall-h">
        <div className="container stack" style={{ gap: 22 }}>
          <h2 id="wall-h" className="serif h-m">The Wall</h2>
          <p className="lede" style={{ maxWidth: 620 }}>{L.line}</p>
          <iframe
            src={`${business.links.theWall}/?embed`}
            title="The Wall: the old photographs by the host stand. Tap any frame to see it up close."
            loading="lazy"
            allow="fullscreen"
            className="wall-embed"
          />
          <a href={business.links.theWall} className="arrow-link" target="_blank" rel="noopener">Open The Wall full screen</a>
        </div>
      </section>
      <section className="section bg-frost">
        <div className="container card-grid">
          <figure className="figure">
            <Image src="/photos/history-grand-opening-ad.jpg" alt="Newspaper ad announcing the grand opening of River Ranch, Sunday, Nov. 22, at the entrance to Alpine Meadows" width={900} height={1375} sizes="(max-width: 700px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto' }} />
            <figcaption>The grand opening ad, “Sunday, Nov. 22.” From the wall.</figcaption>
          </figure>
          <figure className="figure">
            <Image src="/photos/history-1992-anniversary-poster.jpg" alt="1992 River Ranch Lodge anniversary party poster: Be there or be square, November 20, 1992, celebrating 20 years of Tahoe tradition" width={1000} height={1245} sizes="(max-width: 700px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto' }} />
            <figcaption>“Be there or be square”: the anniversary party, November 20, 1992.</figcaption>
          </figure>
          <figure className="figure">
            <Image src={photos.theWall.src} alt={photos.theWall.alt} width={photos.theWall.width} height={photos.theWall.height} sizes="(max-width: 700px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto' }} />
            <figcaption>The wall by the host stand today.</figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
