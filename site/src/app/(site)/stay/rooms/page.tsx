import type { Metadata } from 'next';
import Image from 'next/image';
import { RoomFinder } from '@/components/RoomBooking';
import { SiteHeader } from '@/components/SiteHeader';
import { Lines } from '@/components/fl/Lines';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { StayBook } from '../StayBook';
import '../stay.css';

export const metadata: Metadata = {
  title: 'Rooms on the Truckee River',
  description:
    '19 rooms in lodgepole pine and antiques above the Truckee River in Tahoe City: river views, balconies and decks, dog-friendly rooms and budget rooms for skiers.',
  alternates: { canonical: '/stay/rooms' },
};

const COUNTS = [
  { num: String(business.rooms), label: 'Rooms' },
  { num: '7', label: 'With a balcony', em: true },
  { num: '3', label: 'With a deck' },
  { num: '9', label: 'Dog-friendly', em: true },
  { num: '3', label: 'Budget rooms, for skiers who just need a bed' },
];

const AMENITIES = [
  <>En-suite <em>bath</em></>,
  <>Flatscreen <em>TV</em></>,
  <>Free <em>Wi-Fi</em></>,
  <>Keurig <em>coffee maker</em></>,
  <><em>Mini-fridge</em></>,
];

const GALLERY = [
  { photo: photos.kingRoom, tall: false },
  { photo: photos.balconySnowyRiver, tall: true },
  { photo: photos.roomBearQuilt, tall: false },
  { photo: photos.roomSnowshoes, tall: true },
  { photo: photos.roomPlaidQuilt, tall: false },
  { photo: photos.balconyChairs, tall: true },
];

export default function RoomsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Rooms', '/stay/rooms')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero page-hero--short sty-hero--rooms">
        <div className="page-hero__media">
          <Image src={photos.balconyChairs.src} alt={photos.balconyChairs.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Rooms</p>
          <Lines as="h1" className="display-l" lines={['Nineteen rooms,', <em key="r">one river.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">Log beds, quilts and old skis on the walls. Most rooms look right at the Truckee.</p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <a href="#finder" className="btn">Choose your dates</a>
          </div>
        </div>
      </section>

      <section className="section section--snow" aria-labelledby="rooms-h">
        <div className="container">
          <div className="split split--top">
            <div className="stack">
              <p className="label label--accent" data-reveal>{business.rooms} rooms</p>
              <Lines id="rooms-h" className="display-l" lines={['A room for', <>every kind <em>of skier.</em></>]} />
            </div>
            <div className="stack sty-intro__copy">
              <p className="lede" data-reveal>Each room is furnished in lodgepole pine, hickory, birch and antiques, and most have a view of the Truckee.</p>
              <p data-reveal data-reveal-delay="200"><a className="link-arrow" href="#finder">Choose your dates and room</a></p>
            </div>
          </div>
          <div className="sty-facts sty-facts--5">
            {COUNTS.map((c, i) => (
              <div key={c.label} className="fact" data-reveal data-reveal-delay={i ? String(i * 100) : undefined}>
                <span className="fact__num">{c.em ? <em>{c.num}</em> : c.num}</span>
                <span className="label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark" id="finder" aria-labelledby="types-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Room types</p>
            <Lines id="types-h" className="display-l" lines={['Choose your', <>dates <em>and room.</em></>]} />
            <p className="lede" data-reveal data-reveal-delay="150">Pick your nights, then any room’s button opens live rates with that room at the top.</p>
          </div>
          <RoomFinder />
        </div>
      </section>

      <section className="section section--snow" id="in-room" aria-labelledby="in-room-h">
        <div className="container split">
          <figure className="frame frame--tall" data-reveal="clip">
            <Image src={photos.roomBearQuilt.src} alt={photos.roomBearQuilt.alt} fill sizes="(max-width: 860px) 100vw, 600px" />
          </figure>
          <div className="stack-l">
            <div className="stack">
              <p className="label label--accent" data-reveal>In every room</p>
              <Lines id="in-room-h" className="display-l" lines={['The essentials,', <em key="a">all of them.</em>]} />
            </div>
            <ul className="rows sty-amenities">
              {AMENITIES.map((a, i) => (
                <li key={i} data-reveal data-reveal-delay={String(i * 80)}>
                  <span className="row__title">{a}</span>
                </li>
              ))}
            </ul>
            <p className="muted" data-reveal>Non-smoking throughout. Stairs, no elevator.</p>
          </div>
        </div>
      </section>

      <section className="section section--dark section--tight sty-gallery-band" aria-label="Photos of the rooms">
        <div className="sty-gallery" style={{ marginTop: 0 }}>
          <p className="label sty-gallery__hint container" data-reveal>Drag to look around</p>
          <div className="drag-gallery" tabIndex={0} aria-label="Photos of the rooms" data-reveal="fade">
            <div className="drag-gallery__track">
              {GALLERY.map(({ photo, tall }) => (
                <figure key={photo.src} className={`frame${tall ? ' frame--tall is-tall' : ''}`}>
                  <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 780px) 72vw, 560px" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StayBook />
    </>
  );
}
