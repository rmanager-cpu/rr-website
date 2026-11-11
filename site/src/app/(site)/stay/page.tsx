import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { Lines } from '@/components/fl/Lines';
import { homePhotos, photos } from '@/content/photos';
import { business, hours, lodging } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { StayBook } from './StayBook';
import { StayCurtain } from './StayCurtain';
import { StayRooms } from './StayRooms';
import './stay.css';

export const metadata: Metadata = {
  title: 'Tahoe City Lodging near Palisades Tahoe',
  description:
    '19 lodge rooms on the Truckee River in Tahoe City, most with river views, some with balconies and dog-friendly options. The closest lodging to Palisades Tahoe’s Alpine Meadows base.',
  alternates: { canonical: '/stay' },
};

const COUNTS = [
  { num: '7', label: 'Open onto balconies', em: true },
  { num: '3', label: 'Open onto decks' },
  { num: '9', label: 'Welcome dogs', em: true },
  { num: '3', label: 'Budget rooms, for skiers who just need a bed' },
];

const GALLERY = [photos.kingRoom, photos.balconyChairs, photos.roomBearQuilt, photos.roomSnowshoes, photos.roomPlaidQuilt, homePhotos.skiRoom];

const DOORS = [
  { href: '/stay/rooms', title: 'Rooms', photo: photos.roomPlaidQuilt, line: 'Every room type, with photos and live rates for your dates.' },
  { href: '/stay/packages', title: 'Packages', photo: photos.heroNight, line: 'Ski all day, sleep by the river.' },
  { href: '/stay/guest-info', title: 'Guest info', photo: homePhotos.entrance, line: 'Check-in, dogs, parking and the rest.' },
];

export default function StayPage() {
  const KNOW = [
    { title: <>Coming and <em>going</em></>, body: <>Check-in is at {lodging.checkIn}. Check-out is at {lodging.checkOut}.</> },
    { title: <>Bring <em>the dog</em></>, body: <>Welcome in dog-friendly rooms. Up to two, $25 plus tax per night, arranged in advance. And on the patio, on a leash.</> },
    { title: <>In <em>every room</em></>, body: <>An en-suite bath, a flatscreen TV, free Wi-Fi, a Keurig and a mini-fridge.</> },
    {
      title: <>Dinner is <em>downstairs</em></>,
      body: (
        <>
          So is the round bar. {hours.dinner.label} {hours.dinner.days.toLowerCase()}, <span className="sty-nowrap">{hours.dinner.time}</span>. No drive home. That’s the whole trick.{' '}
          <Link className="text-link" href="/dine">See Dine</Link>
        </>
      ),
    },
    { title: <>Where <em>we are</em></>, body: <>On the Truckee, at the bottom of Alpine Meadows Road, a few minutes from Palisades Tahoe and Lake Tahoe.</> },
    { title: <>Ski <em>packages</em></>, body: <>Stay tuned. They post once Palisades Tahoe sets its prices and opening day.</> },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema('Stay', '/stay')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero sty-hero">
        <div className="page-hero__media">
          <Image src={photos.heroNight.src} alt={photos.heroNight.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Stay</p>
          <Lines as="h1" className="display-xl" lines={['Wake up', <>on <em>the river.</em></>]} />
          <p className="lede" data-reveal data-reveal-delay="300">Nineteen rooms above the Truckee. Snow on the railing, coffee in the room, the mountain up the road.</p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <a href="#book" className="btn">Book a room</a>
            <a href="#rooms" className="btn btn--ghost">See the rooms</a>
          </div>
        </div>
      </section>

      <section className="section section--snow sty-intro" aria-labelledby="lodge-h">
        <div className="container">
          <div className="split split--top">
            <div className="stack">
              <p className="label label--accent" data-reveal>The lodge</p>
              <Lines id="lodge-h" className="display-l" lines={['Pine, hickory,', 'birch and a river', <em key="w">out the window.</em>]} />
            </div>
            <div className="stack sty-intro__copy">
              <p className="lede" data-reveal>
                All {business.rooms} rooms are furnished in lodgepole pine, hickory, birch and a few good antiques, and most of them look at the Truckee.
              </p>
              <p className="prose" data-reveal data-reveal-delay="120">The bar and restaurant are downstairs. Plan accordingly.</p>
              <p data-reveal data-reveal-delay="200"><a className="link-arrow" href="#book">Pick your nights</a></p>
            </div>
          </div>
          <div className="sty-facts">
            {COUNTS.map((c, i) => (
              <div key={c.label} className="fact" data-reveal data-reveal-delay={i ? String(i * 100) : undefined}>
                <span className="fact__num">{c.em ? <em>{c.num}</em> : c.num}</span>
                <span className="label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StayCurtain />

      <section className="section section--dark sty-rooms" id="rooms" aria-labelledby="types-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>The rooms</p>
            <Lines id="types-h" className="display-l" lines={['Pick your', <em key="w">window.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">Every room has its own bath, a flatscreen, free Wi-Fi, a Keurig and a mini-fridge.</p>
          </div>
          <StayRooms />
          <div className="sty-rooms__foot" data-reveal>
            <p className="muted">The rooms over the bar and the kitchen cost less for a reason: you might hear the kitchen at work.</p>
            <Link href="/stay/rooms" className="link-arrow">Photos and rates for every room</Link>
          </div>
        </div>

        <div className="sty-gallery">
          <p className="label sty-gallery__hint container" data-reveal>Drag to look around</p>
          <div className="drag-gallery" tabIndex={0} aria-label="Photos of the rooms" data-reveal="fade">
            <div className="drag-gallery__track">
              {GALLERY.map((p) => (
                <figure key={p.src} className="frame">
                  <Image src={p.src} alt={p.alt} fill sizes="(max-width: 780px) 72vw, 560px" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StayBook />

      <section className="section section--dark section--tight sty-doors" aria-labelledby="more-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>More about staying</p>
            <Lines id="more-h" className="display-m" lines={[<>Rooms, packages <em>and the rest.</em></>]} />
          </div>
          <div className="fl-doors">
            {DOORS.map((d, i) => (
              <Link key={d.href} href={d.href} className="fl-door" data-reveal data-reveal-delay={i ? String(i * 120) : undefined}>
                <Image src={d.photo.src} alt="" fill sizes="(max-width: 860px) 100vw, 33vw" />
                <span className="fl-door__body">
                  <span className="fl-door__name">{d.title}</span>
                  <span className="fl-door__line">{d.line}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--ember sty-know" aria-labelledby="know-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Good to know</p>
            <Lines id="know-h" className="display-m" lines={[<>The <em>fine print,</em> kept short.</>]} />
          </div>
          <div className="sty-know__grid">
            {KNOW.map((k, i) => (
              <div key={i} data-reveal data-reveal-delay={i % 3 ? String((i % 3) * 100) : undefined}>
                <h3 className="display-s">{k.title}</h3>
                <p className="muted">{k.body}</p>
              </div>
            ))}
          </div>
          <div className="btn-row sty-know__cta" data-reveal>
            <a href="#book" className="btn">Book a room</a>
            <Link href="/stay/guest-info" className="btn btn--ghost">Parking, storage and the rest</Link>
            <Link href="/dine/happening" className="btn btn--ghost">See what’s on</Link>
          </div>
        </div>
      </section>
    </>
  );
}
