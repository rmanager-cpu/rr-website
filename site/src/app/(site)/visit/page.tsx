import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business, fullAddress, hours, lodging } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import './visit.css';

export const metadata: Metadata = {
  title: 'Directions & Contact, Tahoe City',
  description: `Find River Ranch at ${fullAddress}, on Highway 89 between Tahoe City and Palisades Tahoe. Hours, phone, email, gift cards, rewards and jobs.`,
  alternates: { canonical: '/visit' },
};

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${fullAddress}`)}`;

// Ways in. Facts from the Guest Info page; keep them in step with it.
const WAYS = [
  { name: 'By car', line: 'Highway 89, at the bottom of Alpine Meadows Road. Park free on site; the lodge and restaurant share the lot.' },
  { name: 'From the mountain', line: 'Palisades Tahoe’s Alpine Meadows base is a few minutes up the road. Ski all day, roll downhill to the bar.' },
  { name: 'By bike', line: 'The paved river trail runs right past the lodge, about 3.5 miles each way to Tahoe City.' },
  { name: 'By raft', line: 'Float the Truckee from Tahoe City and finish on our patio, May to September, weather permitting.' },
];

// Who to ask, by email.
const CONTACTS = [
  { name: 'Front desk', email: business.email.lodge },
  { name: 'Restaurant', email: business.email.restaurant },
  { name: 'Events', email: business.email.events },
];

// Hours, one row each: what, which days, when.
const HOURS = [
  { name: hours.dinner.label, days: hours.dinner.days, time: hours.dinner.time },
  { name: hours.happyHour.label, days: `${hours.happyHour.days}. ${hours.happyHour.note}.`, time: hours.happyHour.time },
  { name: hours.breakfast.label, days: hours.breakfast.days, time: hours.breakfast.time },
  { name: 'Check-in', days: 'The lodge', time: lodging.checkIn },
  { name: 'Check-out', days: 'The lodge', time: lodging.checkOut },
];

export default function VisitPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Visit', '/visit')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero page-hero--short">
        <div className="page-hero__media">
          <Image src={photos.heroDay.src} alt={photos.heroDay.alt} fill priority sizes="100vw" data-parallax="0.15" style={{ objectPosition: '50% 40%' }} />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Visit</p>
          <Lines as="h1" className="display-xl" lines={['Find us', <em key="e">on the river.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">On Highway 89 between Tahoe City and Palisades Tahoe, right on the Truckee. Free parking on site.</p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <a href={mapsUrl} className="btn" target="_blank" rel="noopener">Get directions</a>
            <a href={`tel:${business.phoneE164}`} className="btn btn--ghost">Call {business.phone}</a>
          </div>
        </div>
      </section>

      {/* The details, on snow white */}
      <section className="section section--snow" aria-labelledby="vi-details-h">
        <div className="container split split--top">
          <div>
            <div className="section-head">
              <p className="label label--accent" data-reveal>The details</p>
              <Lines id="vi-details-h" className="display-l" lines={['Where, when,', <>and <em>who to ask.</em></>]} />
            </div>
            <dl className="vi-contact">
              <div data-reveal>
                <dt className="label">Address</dt>
                <dd>
                  <a href={mapsUrl} target="_blank" rel="noopener" className="vi-big">
                    {business.address.street}
                    <br />
                    {business.address.city}, {business.address.region} {business.address.postalCode}
                  </a>
                </dd>
              </div>
              <div data-reveal data-reveal-delay="100">
                <dt className="label">Phone</dt>
                <dd><a href={`tel:${business.phoneE164}`} className="vi-big">{business.phone}</a></dd>
              </div>
              {CONTACTS.map((c, i) => (
                <div key={c.name} data-reveal data-reveal-delay={String(200 + i * 80)}>
                  <dt className="label">{c.name}</dt>
                  <dd><a href={`mailto:${c.email}`}>{c.email}</a></dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="frame frame--tall vi-photo" data-reveal="clip">
            <Image src={photos.frontEntranceNight.src} alt={photos.frontEntranceNight.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
          </figure>
        </div>
      </section>

      {/* Hours, on charcoal */}
      <section className="section section--dark" aria-labelledby="vi-hours-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Hours</p>
            <Lines id="vi-hours-h" className="display-l" lines={['Dinner every night,', <em key="e">breakfast on weekends.</em>]} />
          </div>
          <ul className="rows vi-hours">
            {HOURS.map((h, i) => (
              <li key={h.name} data-reveal data-reveal-delay={String(i * 80)}>
                <span className="row__title">{h.name}</span>
                <span className="row__note">{h.days}</span>
                <span className="vi-hours__time">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Getting here, on frost */}
      <section className="section section--frost" aria-labelledby="vi-ways-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Getting here</p>
            <Lines id="vi-ways-h" className="display-l" lines={['Four ways in.', <em key="e">One is a raft.</em>]} />
          </div>
          <ol className="vi-ways">
            {WAYS.map((w, i) => (
              <li key={w.name} data-reveal data-reveal-delay={String(i * 100)}>
                <span className="vi-ways__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="display-s">{w.name}</h3>
                <p>{w.line}</p>
              </li>
            ))}
          </ol>
          <p className="vi-ways__map" data-reveal>
            <a href={mapsUrl} className="link-arrow" target="_blank" rel="noopener">Open the map</a>
          </p>
        </div>
      </section>

      {/* Gift cards and jobs, on ember */}
      <section className="section section--ember" aria-label="Gift cards and jobs">
        <div className="container vi-more">
          <div className="vi-more__item" id="gift-cards" data-reveal>
            <p className="label label--accent">Gift cards &amp; rewards</p>
            <h2 className="display-m">Give someone a night <em>on the river.</em></h2>
            <p className="lede">Restaurant gift cards online, lodge gift certificates by phone, and River Ranch Rewards for the regulars.</p>
            <p><Link href="/loyalty-and-gift-cards" className="link-arrow">Loyalty &amp; gift cards</Link></p>
          </div>
          <div className="vi-more__item" id="jobs" data-reveal data-reveal-delay="150">
            <p className="label label--accent">Jobs</p>
            <h2 className="display-m">Come work <em>on the river.</em></h2>
            <p className="lede">Front of house, back of house, the lodge and more.</p>
            <p><Link href="/careers" className="link-arrow">Apply on our Careers page</Link></p>
          </div>
        </div>
      </section>
    </>
  );
}
