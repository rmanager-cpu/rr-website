import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import Image from 'next/image';
import { ApresSection } from '@/components/ApresSection';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business, hours } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { StayBook } from '../StayBook';

export const metadata: Metadata = {
  title: 'Ski & Stay Packages near Palisades Tahoe',
  description:
    'Ski & stay at the closest lodging to Palisades Tahoe’s Alpine Meadows base: rooms on the Truckee River, ski lockers, rentals delivered to your room by Ski Butlers, and happy hour at the round bar after the lifts close.',
  alternates: { canonical: '/stay/packages' },
};

export default function PackagesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Packages', '/stay/packages')} />
      <SiteHeader />

      <section className="page-hero">
        <div className="page-hero__bg">
          <Image src={photos.snowyRiverLodge.src} alt={photos.snowyRiverLodge.alt} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="container page-hero__body">
          <h1 className="slash h-l" style={{ color: 'var(--ice)' }}>Packages</h1>
          <p>{L.line}</p>
        </div>
      </section>

      <section className="section" id="ski-and-stay" aria-labelledby="ski-h">
        <div className="container media-row" style={{ gap: 48, alignItems: 'flex-start' }}>
          <div className="grow stack" style={{ gap: 28 }}>
            <span className="eyebrow">Ski &amp; Stay · closest lodging to Palisades Tahoe – Alpine Meadows base</span>
            <h2 id="ski-h" className="serif h-m">{L.head2}</h2>
            <div className="prose">
              <p>We’re on the Truckee River between Tahoe City and the mountain, and <a href={business.links.palisades} rel="noopener">Palisades Tahoe</a> is minutes up the road.</p>
            </div>
            <dl className="facts">
              <div><dt>Rentals</dt><dd><a href={business.links.skiButlers} rel="noopener">Ski Butlers</a> delivers to your room, with 10% off for our guests</dd></div>
              <div><dt>Ski lockers</dt><dd>In winter. Skis and boards stay out of the rooms.</dd></div>
              <div><dt>Breakfast</dt><dd>Grab-and-go for hotel guests when occupancy allows; full breakfast {hours.breakfast.days}, {hours.breakfast.time}</dd></div>
              <div><dt>Après</dt><dd>{hours.happyHour.label} {hours.happyHour.days}, {hours.happyHour.time}, at the bar</dd></div>
              <div><dt>Dinner</dt><dd>{hours.dinner.days}, {hours.dinner.time}</dd></div>
            </dl>
          </div>
          <div className="side">
            <Image src={photos.roomSnowshoes.src} alt={photos.roomSnowshoes.alt} width={photos.roomSnowshoes.width} height={photos.roomSnowshoes.height} sizes="(max-width: 900px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>

      <section className="section bg-frost" id="deals" aria-labelledby="deals-h">
        <div className="container stack" style={{ gap: 22, maxWidth: 900 }}>
          <span className="eyebrow">Seasonal deals</span>
          <h2 id="deals-h" className="serif h-m">{L.head3}</h2>
          <p className="lede">This season’s offers are on the way. Ask the front desk about current rates at <a href={`tel:${business.phoneE164}`}>{business.phone}</a>.</p>
        </div>
      </section>

      <ApresSection eyebrow="After the lifts close" />

      <StayBook />
    </>
  );
}
