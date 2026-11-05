import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Our History: A Century on the Truckee River',
  description:
    'River Ranch Lodge started out as Deer Park Lodge on the Truckee River. Read the short version, then explore The Wall: the old photos, clippings and menus by the host stand.',
  alternates: { canonical: '/history' },
};

// How solid each line is: "History facts" in docs/HISTORY-WALL.md. Don't state 1888 as fact. Management
// wants this kept to five sentences at most, with the live music connection in it.
export default function HistoryPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('History', '/history')} />
      <SiteHeader />
      <section className="section">
        <div className="container stack" style={{ gap: 26, maxWidth: 980 }}>
          <span className="eyebrow">Our history</span>
          <h1 className="slash h-l">A century on the Truckee, give or take a Depression</h1>
          <div className="prose">
            <p>The story starts with Deer Park, a resort up Bear Creek from the 1880s, though how much of that is really ours depends on who’s pouring. River Ranch has long been where the mountain comes down to have fun: Wild Winter Wednesdays, the SnowFest snow sculpture contest, and summer rafters floating straight onto the patio. By 1997 Leftover Salmon and the String Cheese Incident were playing here, Umphrey’s McGee came through in 2003, Renegade Productions brought the Summer Concert Series to the patio, and it’s still packing the place. Now it’s a venue as much as a lodge: live shows, weddings and private parties, right on the river.</p>
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
          <p className="lede" style={{ maxWidth: 620 }}>The old photographs, clippings and menus by the host stand. Tap any frame to see it up close.</p>
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
