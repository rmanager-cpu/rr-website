import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { Lines } from '@/components/fl/Lines';
import { homePhotos, photos } from '@/content/photos';
import { business, lodging } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { StayBook } from '../StayBook';
import '../stay.css';

export const metadata: Metadata = {
  title: 'Guest Info: Check-in, Dogs, Parking & More',
  description: `Check-in ${lodging.checkIn}, check-out ${lodging.checkOut}. Dogs, parking, ski and bike storage, breakfast and what's nearby for guests of River Ranch Lodge in Tahoe City.`,
  alternates: { canonical: '/stay/guest-info' },
};

const FAQ = [
  { q: 'How do I book a room?', a: `Book online any time, or call the front desk at ${business.phone}.` },
  { q: 'What time is check-in and check-out?', a: `Check-in is at ${lodging.checkIn} and check-out is at ${lodging.checkOut}. Arriving after 5 PM? Give the front desk a call.` },
  { q: 'Are dogs allowed?', a: 'Yes, in our dog-friendly rooms: up to two dogs, $25 plus tax per night, arranged in advance. Dogs can’t be left alone in the room.' },
  { q: 'Is breakfast included?', a: 'Hotel guests get a complimentary grab-and-go breakfast when occupancy allows. The restaurant serves a full breakfast on Saturdays and Sundays.' },
  { q: 'How close are you to Palisades Tahoe?', a: 'We’re the closest lodging to Palisades Tahoe’s Alpine Meadows base, on the Truckee River between Tahoe City and the mountain.' },
  { q: 'Where can I store skis and bikes?', a: 'Ski lockers in winter and bike racks in summer (bring your own lock). Skis, boards, rafts and bikes stay out of the rooms.' },
];

export default function GuestInfoPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <>
      <JsonLd data={breadcrumbSchema('Guest Info', '/stay/guest-info')} />
      <JsonLd data={faqSchema} />
      <SiteHeader variant="overlay" />

      <section className="page-hero page-hero--short sty-hero--entrance">
        <div className="page-hero__media">
          <Image src={homePhotos.entrance.src} alt={homePhotos.entrance.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Guest info</p>
          <Lines as="h1" className="display-l" lines={['Before you', <em key="g">get here.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">Check-in, dogs, parking and the rest. Anything else, the front desk has you.</p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <a href={`tel:${business.phoneE164}`} className="btn">Call {business.phone}</a>
            <a href={`mailto:${business.email.lodge}`} className="btn btn--ghost">Email the front desk</a>
          </div>
        </div>
      </section>

      <section className="section section--snow" aria-labelledby="know-h">
        <div className="container split split--top">
          <div className="stack-l">
            <div className="stack">
              <p className="label label--accent" data-reveal>Good to know</p>
              <Lines id="know-h" className="display-l" lines={['The short', <em key="v">version.</em>]} />
              <p className="lede" data-reveal data-reveal-delay="150">
                The front desk is at <a className="text-link" href={`tel:${business.phoneE164}`}>{business.phone}</a> and <a className="text-link" href={`mailto:${business.email.lodge}`}>{business.email.lodge}</a>.
              </p>
            </div>
            <dl className="fl-facts" data-reveal data-reveal-delay="250">
              <div><dt>Check-in</dt><dd>{lodging.checkIn}</dd></div>
              <div><dt>Check-out</dt><dd>{lodging.checkOut}</dd></div>
              <div><dt>Dogs</dt><dd>Welcome in select rooms, up to two, $25 plus tax a night</dd></div>
              <div><dt>Getting around</dt><dd>Stairs, no elevator</dd></div>
              <div><dt>Smoking</dt><dd>Non-smoking throughout</dd></div>
              <div><dt>Parking</dt><dd>Free on site, shared with the restaurant</dd></div>
              <div><dt>Ski &amp; bike storage</dt><dd>Ski lockers in winter, bike racks in summer</dd></div>
              <div><dt>Wi-Fi</dt><dd>Free, in every room</dd></div>
            </dl>
          </div>
          <figure className="frame frame--tall" data-reveal="clip">
            <Image src={photos.balconySnowyRiver.src} alt={photos.balconySnowyRiver.alt} fill sizes="(max-width: 860px) 100vw, 600px" />
          </figure>
        </div>
      </section>

      <section className="section section--dark" id="nearby" aria-labelledby="nearby-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Out the door</p>
            <Lines id="nearby-h" className="display-l" lines={['What’s', <em key="n">nearby.</em>]} />
          </div>
          <ul className="sty-nearby">
            <li data-reveal>
              <h3 className="display-s"><em>Skiing</em></h3>
              <p><a className="text-link" href={business.links.palisades} rel="noopener">Palisades Tahoe</a> is minutes up the road. See <Link className="text-link" href="/stay/packages">Ski &amp; Stay</Link>.</p>
            </li>
            <li data-reveal data-reveal-delay="120">
              <h3 className="display-s"><em>Rafting</em></h3>
              <p>Float the Truckee from Tahoe City and finish on our patio, May to September, weather permitting.</p>
            </li>
            <li data-reveal data-reveal-delay="240">
              <h3 className="display-s"><em>Biking</em></h3>
              <p>The paved river trail runs past the lodge, about 3.5 miles each way to Tahoe City.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="section section--snow" aria-labelledby="stay-faq-h">
        <div className="container sty-faq">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Questions</p>
            <Lines id="stay-faq-h" className="display-l" lines={['Questions,', <em key="a">answered.</em>]} />
          </div>
          <div className="faq" data-reveal>
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <StayBook />
    </>
  );
}
