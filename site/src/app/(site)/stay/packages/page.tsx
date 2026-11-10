import type { Metadata } from 'next';
import Image from 'next/image';
import { ApresSection } from '@/components/ApresSection';
import { SiteHeader } from '@/components/SiteHeader';
import { Lines } from '@/components/fl/Lines';
import { homePhotos, photos } from '@/content/photos';
import { business, hours } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { StayBook } from '../StayBook';
import '../stay.css';

export const metadata: Metadata = {
  title: 'Ski & Stay Packages near Palisades Tahoe',
  description:
    'Ski & stay at the closest lodging to Palisades Tahoe’s Alpine Meadows base: rooms on the Truckee River, ski lockers, and happy hour at the round bar after the lifts close.',
  alternates: { canonical: '/stay/packages' },
};

export default function PackagesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Packages', '/stay/packages')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero page-hero--short sty-hero--packages">
        <div className="page-hero__media">
          <Image src={photos.snowyRiverLodge.src} alt={photos.snowyRiverLodge.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Packages</p>
          <Lines as="h1" className="display-l" lines={['Ski all day.', <>Sleep by <em>the river.</em></>]} />
          <p className="lede" data-reveal data-reveal-delay="300">The closest lodging to Palisades Tahoe’s Alpine Meadows base, with the bar downstairs for after.</p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <a href="#book" className="btn">Book a room</a>
            <a href="#deals" className="btn btn--ghost">This season’s packages</a>
          </div>
        </div>
      </section>

      <section className="section section--snow" id="ski-and-stay" aria-labelledby="ski-h">
        <div className="container split">
          <div className="stack-l">
            <div className="stack">
              <p className="label label--accent" data-reveal>Ski &amp; Stay</p>
              <Lines id="ski-h" className="display-l" lines={['Minutes from', <em key="l">the lifts.</em>]} />
              <p className="lede" data-reveal data-reveal-delay="150">
                We’re on the Truckee River between Tahoe City and the mountain, and <a className="text-link" href={business.links.palisades} rel="noopener">Palisades Tahoe</a> is minutes up the road.
              </p>
            </div>
            <dl className="facts" data-reveal data-reveal-delay="250">
              <div><dt>Ski lockers</dt><dd>In winter. Skis and boards stay out of the rooms.</dd></div>
              <div><dt>Breakfast</dt><dd>Grab-and-go for hotel guests when occupancy allows; full breakfast {hours.breakfast.days}, <span className="sty-nowrap">{hours.breakfast.time}</span></dd></div>
              <div><dt>Après</dt><dd>{hours.happyHour.label} {hours.happyHour.days}, <span className="sty-nowrap">{hours.happyHour.time}</span>, at the bar</dd></div>
              <div><dt>Dinner</dt><dd>{hours.dinner.days}, <span className="sty-nowrap">{hours.dinner.time}</span></dd></div>
            </dl>
          </div>
          <figure className="frame frame--tall" data-reveal="clip">
            <Image src={homePhotos.skiRoom.src} alt={homePhotos.skiRoom.alt} fill sizes="(max-width: 860px) 100vw, 600px" />
          </figure>
        </div>
      </section>

      <section className="section section--frost" id="deals" aria-labelledby="deals-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>This season</p>
            <Lines id="deals-h" className="display-l" lines={['This winter’s', <em key="p">packages.</em>]} />
          </div>
          <article className="card sty-package" data-reveal>
            <div className="card__body">
              <h3 className="display-m">Stay <em>tuned.</em></h3>
              <p className="lede">
                Ski packages post as soon as Palisades Tahoe sets its lift prices and opening day. Until then, rooms are open for booking, and the front desk has rates for your dates at <a className="text-link" href={`tel:${business.phoneE164}`}>{business.phone}</a>.
              </p>
            </div>
          </article>
        </div>
      </section>

      <ApresSection
        eyebrow="After the lifts close"
        detail="Boots off, drinks up. At the round bar, dine-in, not on holidays."
      />

      <StayBook />
    </>
  );
}
