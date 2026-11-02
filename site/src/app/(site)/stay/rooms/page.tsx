import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import Image from 'next/image';
import { RoomFinder } from '@/components/RoomBooking';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { StayBook } from '../StayBook';

export const metadata: Metadata = {
  title: 'Rooms on the Truckee River',
  description:
    '19 rooms in lodgepole pine and antiques above the Truckee River in Tahoe City: river views, balconies and decks, dog-friendly rooms and budget rooms for skiers.',
  alternates: { canonical: '/stay/rooms' },
};

const GALLERY = [photos.kingRoom, photos.roomBearQuilt, photos.roomPlaidQuilt, photos.balconySnowyRiver, photos.roomSnowshoes, photos.balconyChairs];

export default function RoomsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Rooms', '/stay/rooms')} />
      <SiteHeader />

      <section className="page-hero">
        <div className="page-hero__bg">
          <Image src={photos.balconyChairs.src} alt={photos.balconyChairs.alt} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="container page-hero__body">
          <h1 className="slash h-l" style={{ color: 'var(--ice)' }}>Rooms</h1>
          <p>{L.line}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="rooms-h">
        <div className="container stack" style={{ gap: 40 }}>
          <div className="stack" style={{ gap: 22, maxWidth: 760 }}>
            <span className="eyebrow">{business.rooms} rooms</span>
            <h2 id="rooms-h" className="serif h-m">{L.head2}</h2>
            <div className="prose">
              <p>Each room is furnished in lodgepole pine, hickory, birch and antiques, and most have a view of the Truckee.</p>
            </div>
          </div>
          <dl className="facts">
            <div><dt>Rooms</dt><dd>{business.rooms}</dd></div>
            <div><dt>With a balcony</dt><dd>7</dd></div>
            <div><dt>With a deck</dt><dd>3</dd></div>
            <div><dt>Dog-friendly</dt><dd>9</dd></div>
            <div><dt>Budget rooms</dt><dd>3, for skiers who just need a bed</dd></div>
          </dl>
        </div>
      </section>

      <section className="section bg-frost" aria-labelledby="types-h">
        <div className="container stack" style={{ gap: 28 }}>
          <h2 id="types-h" className="serif h-m">Choose your dates and room</h2>
          <RoomFinder />
        </div>
      </section>

      <section className="section" aria-labelledby="in-room-h">
        <div className="container media-row" style={{ gap: 48, alignItems: 'center' }}>
          <Image src={photos.roomBearQuilt.src} alt={photos.roomBearQuilt.alt} width={photos.roomBearQuilt.width} height={photos.roomBearQuilt.height} sizes="(max-width: 900px) 100vw, 720px" className="rounded grow" style={{ width: '100%', height: 'auto' }} />
          <div className="side stack" style={{ gap: 18 }}>
            <h2 id="in-room-h" className="serif h-s">In every room</h2>
            <ul className="list-dots">
              <li>En-suite bath</li>
              <li>Flatscreen TV</li>
              <li>Free Wi-Fi</li>
              <li>Keurig coffee maker</li>
              <li>Mini-fridge</li>
            </ul>
            <p className="muted" style={{ margin: 0, fontSize: 15 }}>Non-smoking throughout. Stairs, no elevator.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Photos of the rooms">
        <div className="container card-grid">
          {GALLERY.map((ph) => (
            <figure key={ph.src} className="figure">
              <Image src={ph.src} alt={ph.alt} width={ph.width} height={ph.height} sizes="(max-width: 700px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto', aspectRatio: '3 / 2', objectFit: 'cover' }} />
            </figure>
          ))}
        </div>
      </section>

      <StayBook />
    </>
  );
}
