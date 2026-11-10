import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { listMenus } from '@/lib/menus/store';
import { OPENTABLE_BOOKING } from '../reserve-links';
import { Pour } from './Pour';
import { WineGlass } from './WineGlass';
import './wine.css';

export const revalidate = 300;

// Facts come from the back label of the 2021 Owner's Reserve (one vintage so far). Still kept out of
// Google (noindex) until management says the page is ready.
export const metadata: Metadata = {
  title: 'Johanson Family Wine',
  description: 'Johanson Owner’s Reserve Cabernet Sauvignon 2021, estate grown in Coombsville, Napa Valley: the owners’ family wine, poured at River Ranch in Tahoe City.',
  alternates: { canonical: '/dine/wine' },
  robots: { index: false, follow: true },
};

const BOTTLE = { src: '/photos/johanson-estate-cabernet.jpg', alt: 'A bottle of Johanson Estate Cabernet Sauvignon 2021 beside a glass of red' };

export default async function JohansonPage() {
  const wineList = (await listMenus()).some((m) => m.slug === 'wine-list');
  return (
    <>
      <JsonLd data={breadcrumbSchema('Wine', '/dine/wine')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero page-hero--short wn-hero">
        <div className="page-hero__media">
          <Image src={photos.menuWine.src} alt={photos.menuWine.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">The wine</p>
          <Lines as="h1" className="display-xl" lines={['Johanson', <em key="f">Family Wine.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">The owners’ own label: one Napa Cab, poured here by the river.</p>
        </div>
      </section>

      {/* The family, on ember */}
      <section className="section section--ember wn-family" id="family" aria-labelledby="family-h">
        <div className="container split">
          <figure className="frame frame--tall frame--arch" data-reveal="clip">
            <Image src={BOTTLE.src} alt={BOTTLE.alt} fill sizes="(max-width: 860px) 100vw, 500px" style={{ objectPosition: '50% 0%' }} />
          </figure>
          <div className="stack">
            <p className="label label--accent" data-reveal>The family</p>
            <Lines id="family-h" className="display-l" lines={['Their name is', <em key="b">on the bottle.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">The Johanson family grows its own Cabernet in Coombsville, in Napa Valley, and set out to make a little luxury you can actually open. River Ranch is where it gets poured.</p>
            <dl className="fl-facts wn-facts" data-reveal data-reveal-delay="250">
              <div><dt>Grape</dt><dd>Cabernet Sauvignon</dd></div>
              <div><dt>Vineyard</dt><dd>Estate grown in Coombsville, Napa Valley</dd></div>
              <div><dt>Winemaker</dt><dd>Julien Fayard</dd></div>
              <div><dt>Bottled</dt><dd>Cellared and bottled in Napa</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* The pour: a glass of deep red fills, then the words */}
      <section className="section section--dark wn-pour" id="pour" aria-labelledby="pour-h">
        <div className="container">
          <WineGlass />
          <Pour />
          <p className="lede" data-reveal>One vintage so far, and it’s on our wine list. Ask for it with dinner.</p>
        </div>
      </section>

      {/* The wines, on snow */}
      <section className="section section--snow wn-wines" id="wines" aria-labelledby="wines-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>The wines</p>
            <Lines id="wines-h" className="display-l" lines={['One wine.', <em key="n">It’s a Napa Cab.</em>]} />
          </div>
          <ul className="rows">
            <li data-reveal>
              <span className="wn-n" aria-hidden="true">i</span>
              <span className="row__title">Cabernet Sauvignon <em>2021</em></span>
              <span className="row__note">Johanson Owner’s Reserve. Estate grown in Coombsville, Napa Valley.</span>
              <span className="chip chip--plain">On the list at dinner</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Take it home */}
      <section className="wn-now grain" id="home" aria-labelledby="now-h">
        <div className="wn-now__media">
          <Image src={photos.fireplaceTableSet.src} alt={photos.fireplaceTableSet.alt} fill sizes="100vw" data-parallax="0.1" />
        </div>
        <div className="container">
          <p className="label label--accent" data-reveal>Take it home</p>
          <Lines id="now-h" className="display-l" lines={['A wine club, and bottles', <em key="f">straight from the family.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="150">Both coming soon. Until then, it’s on the list at dinner.</p>
          <div className="btn-row" data-reveal data-reveal-delay="250">
            <a href={OPENTABLE_BOOKING} className="btn" rel="noopener">Reserve a table</a>
            <Link href="/dine" className="btn btn--ghost">See dinner</Link>
            {wineList && <Link href="/dine/menus/wine-list" className="btn btn--ghost">The wine list</Link>}
          </div>
        </div>
      </section>
    </>
  );
}
