import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { StayBook } from './StayBook';

export const metadata: Metadata = {
  title: 'Tahoe City Lodging near Palisades Tahoe',
  description:
    '19 lodge rooms on the Truckee River in Tahoe City, most with river views, some with balconies and dog-friendly options. The closest lodging to Palisades Tahoe.',
  alternates: { canonical: '/stay' },
};

const TABS = [
  { href: '/stay/rooms', title: 'Rooms', photo: photos.kingRoom, line: L.line2 },
  { href: '/stay/packages', title: 'Packages', photo: photos.snowyRiverLodge, line: L.line3 },
  { href: '/stay/guest-info', title: 'Guest Info', photo: photos.roomSnowshoes, line: L.line2 },
];

export default function StayPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Stay', '/stay')} />
      <SiteHeader />

      <section className="page-hero">
        <div className="page-hero__bg">
          <Image src={photos.balconySnowyRiver.src} alt={photos.balconySnowyRiver.alt} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="container page-hero__body">
          <h1 className="slash h-l" style={{ color: 'var(--ice)' }}>Rooms on the Truckee River.</h1>
          <p>{L.line}</p>
          <div className="btn-row">
            <a href={business.links.bookRoom} className="btn btn--amber" rel="noopener">Book a room</a>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="rooms-h">
        <div className="container media-row" style={{ gap: 48, alignItems: 'flex-start' }}>
          <div className="grow stack" style={{ gap: 28 }}>
            <span className="eyebrow">The lodge</span>
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

      <section className="section bg-frost" aria-label="More about staying with us">
        <div className="container card-grid">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className="card">
              <span className="card__media"><Image src={t.photo.src} alt={t.photo.alt} width={t.photo.width} height={t.photo.height} sizes="(max-width: 700px) 100vw, 400px" /></span>
              <span className="card__title">{t.title}</span>
              <span className="card__line">{t.line}</span>
            </Link>
          ))}
        </div>
      </section>

      <StayBook />
    </>
  );
}
