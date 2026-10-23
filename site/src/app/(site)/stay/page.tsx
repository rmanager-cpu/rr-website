import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business, lodging } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Tahoe City Lodging near Palisades Tahoe',
  description:
    '19 lodge rooms on the Truckee River in Tahoe City, most with river views, some with balconies and dog-friendly options. The closest lodging to Palisades Tahoe.',
  alternates: { canonical: '/stay' },
};

const FAQ = [
  { q: 'What time is check-in and check-out?', a: `Check-in is at ${lodging.checkIn} and check-out is at ${lodging.checkOut}. Arriving after 5 PM? Give the front desk a call.` },
  { q: 'Are dogs allowed?', a: 'Yes, in our dog-friendly rooms: up to two dogs, $25 plus tax per night, arranged in advance. Dogs can’t be left alone in the room.' },
  { q: 'Is breakfast included?', a: 'Hotel guests get a complimentary grab-and-go breakfast when occupancy allows. The restaurant serves a full breakfast on Saturdays and Sundays.' },
  { q: 'How close are you to Palisades Tahoe?', a: 'We’re the closest lodging to Palisades Tahoe, on the Truckee River between Tahoe City and the mountain.' },
  { q: 'Where can I store skis and bikes?', a: 'Ski lockers in winter and bike racks in summer (bring your own lock). Skis, boards, rafts and bikes stay out of the rooms.' },
];

export default function StayPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <>
      <JsonLd data={breadcrumbSchema('Stay', '/stay')} />
      <JsonLd data={faqSchema} />
      <SiteHeader />

      <section className="page-hero">
        <div className="page-hero__bg">
          <Image src={photos.balconySnowyRiver.src} alt={photos.balconySnowyRiver.alt} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="container page-hero__body">
          <h1 className="slash h-l" style={{ color: 'var(--ice)' }}>Rooms on the Truckee River.</h1>
          <p>{L.line}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="rooms-h">
        <div className="container media-row" style={{ gap: 48, alignItems: 'flex-start' }}>
          <div className="grow stack" style={{ gap: 28 }}>
            <span className="eyebrow">The rooms</span>
            <h2 id="rooms-h" className="serif h-m">{L.head2}</h2>
            <div className="prose">
              <p>Each of our {business.rooms} rooms is furnished in lodgepole pine, hickory, birch and antiques, and most have a view of the Truckee. Seven open onto balconies, three onto decks, nine welcome dogs, and three are budget rooms for skiers who just need a bed.</p>
              <p>Rooms have an en-suite bath, a flatscreen TV, free Wi-Fi, a Keurig and a mini-fridge. The bar and restaurant are downstairs, open every night.</p>
            </div>
          </div>
          <div className="side">
            <Image src={photos.kingRoom.src} alt={photos.kingRoom.alt} width={photos.kingRoom.width} height={photos.kingRoom.height} sizes="(max-width: 900px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto' }} />
          </div>
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
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="nearby-h">
        <div className="container stack" style={{ gap: 28 }}>
          <span className="eyebrow">Out the door</span>
          <h2 id="nearby-h" className="serif h-m">{L.head3}</h2>
          <ul className="list-dots" style={{ maxWidth: '68ch' }}>
            <li><strong>Skiing:</strong> <a href={business.links.palisades} rel="noopener">Palisades Tahoe</a> is minutes up the road. <a href={business.links.skiButlers} rel="noopener">Ski Butlers</a> delivers rentals to your room, with 10% off for our guests.</li>
            <li><strong>Rafting:</strong> float the Truckee from Tahoe City and finish on our patio, May to September, weather permitting.</li>
            <li><strong>Biking:</strong> the paved river trail runs past the lodge, about 3.5 miles each way to Tahoe City.</li>
          </ul>
        </div>
      </section>

      <section className="section on-night" id="book" aria-labelledby="book-h">
        <div className="container stack" style={{ gap: 22, maxWidth: 900 }}>
          <span className="eyebrow">Book a room</span>
          <h2 id="book-h" className="serif h-m">Call or email the front desk.</h2>
          <p className="lede">{L.line2}</p>
          <div className="btn-row">
            <a href={`tel:${business.phoneE164}`} className="btn btn--amber">{business.phone}</a>
            <a href={`mailto:${business.email.lodge}`} className="btn btn--ghost-cream">{business.email.lodge}</a>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="stay-faq-h">
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
    </>
  );
}
