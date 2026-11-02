import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { business, lodging } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { StayBook } from '../StayBook';

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
      <SiteHeader />

      <section className="section">
        <div className="container stack" style={{ gap: 28 }}>
          <h1 className="slash h-l">Guest Info</h1>
          <p className="lede" style={{ maxWidth: 640 }}>
            The front desk is at <a href={`tel:${business.phoneE164}`}>{business.phone}</a> and <a href={`mailto:${business.email.lodge}`}>{business.email.lodge}</a>.
          </p>
        </div>
      </section>

      <section className="section bg-frost" aria-labelledby="know-h">
        <div className="container stack" style={{ gap: 32 }}>
          <h2 id="know-h" className="serif h-m">Good to know</h2>
          <dl className="facts">
            <div><dt>Check-in</dt><dd>{lodging.checkIn}</dd></div>
            <div><dt>Check-out</dt><dd>{lodging.checkOut}</dd></div>
            <div><dt>Dogs</dt><dd>Welcome in select rooms, $25 a night</dd></div>
            <div><dt>Getting around</dt><dd>Stairs, no elevator</dd></div>
            <div><dt>Smoking</dt><dd>Non-smoking throughout</dd></div>
            <div><dt>Parking</dt><dd>Free on site, shared with the restaurant</dd></div>
            <div><dt>Ski &amp; bike storage</dt><dd>Ski lockers in winter, bike racks in summer</dd></div>
            <div><dt>Wi-Fi</dt><dd>Free, in every room</dd></div>
          </dl>
        </div>
      </section>

      <section className="section" id="nearby" aria-labelledby="nearby-h">
        <div className="container stack" style={{ gap: 28 }}>
          <span className="eyebrow">Out the door</span>
          <h2 id="nearby-h" className="serif h-m">What’s nearby</h2>
          <ul className="list-dots" style={{ maxWidth: '68ch' }}>
            <li><strong>Skiing:</strong> <a href={business.links.palisades} rel="noopener">Palisades Tahoe</a> is minutes up the road. <a href={business.links.skiButlers} rel="noopener">Ski Butlers</a> delivers rentals to your room, with 10% off for our guests. See <Link href="/stay/packages">Ski &amp; Stay</Link>.</li>
            <li><strong>Rafting:</strong> float the Truckee from Tahoe City and finish on our patio, May to September, weather permitting.</li>
            <li><strong>Biking:</strong> the paved river trail runs past the lodge, about 3.5 miles each way to Tahoe City.</li>
          </ul>
        </div>
      </section>

      <section className="section bg-frost" aria-labelledby="stay-faq-h">
        <div className="container stack" style={{ gap: 32 }}>
          <h2 id="stay-faq-h" className="serif h-m">Questions, answered</h2>
          <div className="faq">
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
