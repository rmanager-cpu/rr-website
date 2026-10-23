import Image from 'next/image';
import Link from 'next/link';
import { ApresSection } from '@/components/ApresSection';
import { ArrowRight } from '@/components/Icons';
import { PrivateDinnerPlanner } from '@/components/PrivateDinnerPlanner';
import { TimeOfDayHero } from '@/components/TimeOfDayHero';
import { photos } from '@/content/photos';
import { business, hours } from '@/content/site';

export const metadata = {
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <>
      <TimeOfDayHero />

      {/* THIS WEEK */}
      <section className="this-week" aria-label="This week at River Ranch">
        <div className="container this-week__inner">
          <span className="eyebrow">This week</span>
          <ul className="this-week__list">
            <li><strong>Dinner</strong><span>Nightly · {hours.dinner.time}</span></li>
            <li><strong>Happy hour at the bar</strong><span>Mon–Fri · {hours.happyHour.time}</span></li>
            <li><strong>Weekend breakfast</strong><span>Sat & Sun · {hours.breakfast.time}</span></li>
            <li><strong>Rooms on the river</strong><span>Check-in from 3 PM</span></li>
          </ul>
          <Link href="/events" className="arrow-link">Full calendar <ArrowRight /></Link>
        </div>
      </section>

      {/* 01 CELEBRATE */}
      <section className="section bg-ice" aria-labelledby="celebrate-h">
        <div className="container stack" style={{ gap: 64 }}>
          <div className="row-split">
            <div className="stack" style={{ maxWidth: 760 }}>
              <span className="eyebrow">01 · Celebrate</span>
              <h2 id="celebrate-h" className="slash h-l">Gather by the fire.</h2>
            </div>
            <p className="lede" style={{ maxWidth: 400 }}>
              Private dinners for 13 to 50 guests in the Fireplace room and our other dining rooms, plus parties, ski groups and weddings by the river.
            </p>
          </div>
          <div className="media-row" style={{ gap: 28, alignItems: 'stretch' }}>
            <figure className="figure grow">
              <Image src={photos.fireplacePrivateDinner.src} alt={photos.fireplacePrivateDinner.alt} width={photos.fireplacePrivateDinner.width} height={photos.fireplacePrivateDinner.height} sizes="(max-width: 900px) 100vw, 860px" className="rounded" style={{ width: '100%', height: '100%', minHeight: 420, maxHeight: 620, objectFit: 'cover' }} />
              <figcaption>The Fireplace room, set for a private dinner</figcaption>
            </figure>
            <div className="side" style={{ flexBasis: 340 }}>
              <PrivateDinnerPlanner />
            </div>
          </div>
          <div className="card-grid">
            <Link href="/celebrate#weddings" className="card">
              <span className="card__media"><Image src={photos.weddingArch.src} alt={photos.weddingArch.alt} width={photos.weddingArch.width} height={photos.weddingArch.height} sizes="(max-width: 700px) 100vw, 400px" /></span>
              <span className="card__title">Weddings</span>
              <span className="card__line">Ceremonies on the riverside patio, dinner under the string lights.</span>
            </Link>
            <Link href="/celebrate#private-dining" className="card">
              <span className="card__media"><Image src={photos.fireplaceLongTable.src} alt={photos.fireplaceLongTable.alt} width={photos.fireplaceLongTable.width} height={photos.fireplaceLongTable.height} sizes="(max-width: 700px) 100vw, 400px" /></span>
              <span className="card__title">Private dining &amp; parties</span>
              <span className="card__line">Birthdays, rehearsal dinners and holiday parties with a set menu.</span>
            </Link>
            <Link href="/celebrate#groups" className="card">
              <span className="card__media"><Image src={photos.menuWine.src} alt={photos.menuWine.alt} width={photos.menuWine.width} height={photos.menuWine.height} sizes="(max-width: 700px) 100vw, 400px" /></span>
              <span className="card__title">Corporate &amp; groups</span>
              <span className="card__line">Team dinners and ski groups, minutes from Palisades Tahoe.</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 02 STAY */}
      <section className="section bg-frost" aria-labelledby="stay-h">
        <div className="container stack" style={{ gap: 56 }}>
          <div className="stack" style={{ maxWidth: 820 }}>
            <span className="eyebrow">02 · Stay</span>
            <h2 id="stay-h" className="slash h-l">Wake up over the river.</h2>
          </div>
          <div className="media-row">
            <div className="grow">
              <Image src={photos.balconySnowyRiver.src} alt={photos.balconySnowyRiver.alt} width={photos.balconySnowyRiver.width} height={photos.balconySnowyRiver.height} sizes="(max-width: 900px) 100vw, 860px" className="rounded" style={{ width: '100%', height: 'clamp(320px, 52vw, 640px)', objectFit: 'cover' }} />
            </div>
            <div className="side">
              <Image src={photos.kingRoom.src} alt={photos.kingRoom.alt} width={photos.kingRoom.width} height={photos.kingRoom.height} sizes="(max-width: 900px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 250, objectFit: 'cover' }} />
              <div className="panel">
                <span className="eyebrow">Ski &amp; stay</span>
                <p className="panel__title">The closest lodging to Palisades Tahoe.</p>
                <p className="muted" style={{ fontSize: 15 }}>
                  {business.rooms} rooms in lodgepole pine and antiques, most looking over the Truckee. Ski Butlers delivers rentals to your room, with 10% off for our guests.
                </p>
                <div className="btn-row" style={{ alignItems: 'center', gap: 18 }}>
                  <Link href={business.links.bookRoom} className="btn btn--amber btn--sm">Book a room</Link>
                  <Link href="/stay" style={{ fontWeight: 600 }}>See the rooms</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 MORNINGS */}
      <section className="section bg-ice" aria-labelledby="mornings-h">
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 56 }}>
          <Image src={photos.breakfast.src} alt={photos.breakfast.alt} width={photos.breakfast.width} height={photos.breakfast.height} sizes="(max-width: 700px) 100vw, 460px" className="rounded" style={{ flex: '1 1 340px', width: '100%', maxWidth: 460, height: 'clamp(380px, 60vw, 560px)', objectFit: 'cover' }} />
          <div className="stack" style={{ flex: '1 1 380px' }}>
            <span className="eyebrow">03 · Mornings</span>
            <h2 id="mornings-h" className="slash h-l" style={{ fontSize: 'clamp(46px, 5.8vw, 88px)' }}>Weekend breakfast.</h2>
            <p className="lede">
              Saturdays and Sundays, 8 to 11:30 AM: steak and eggs, Benedicts, biscuits and gravy, and a Bloody Mary if it&apos;s that kind of morning.
            </p>
            <Link href="/dine#breakfast" className="arrow-link">Breakfast menu <ArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* THROUGH THE WINDOW: day turns to night */}
      <section className="window-band" aria-labelledby="dine-h">
        <div className="container window-band__inner">
          <p className="serif" style={{ margin: 0, fontSize: 'clamp(28px, 3.4vw, 46px)', color: 'var(--navy)' }}>When the lifts close, the fire&apos;s going.</p>
          <div className="window">
            <Image src={photos.fireplaceRoom.src} alt={photos.fireplaceRoom.alt} fill sizes="(max-width: 900px) 100vw, 860px" style={{ objectFit: 'cover' }} />
          </div>
          <h2 id="dine-h" className="slash h-xl" style={{ fontSize: 'clamp(56px, 10vw, 164px)', color: 'var(--amber)' }}>Dinner by the fire.</h2>
        </div>
      </section>

      {/* 04 DINE */}
      <section className="on-night" aria-label="Dinner">
        <div className="container stack" style={{ gap: 56, paddingBottom: 120 }}>
          <div className="row-split" style={{ paddingTop: 12, borderTop: '1px solid var(--line-night)' }}>
            <span className="eyebrow">04 · Dine</span>
            <p className="lede" style={{ maxWidth: 520 }}>
              Dinner every night from 5 PM in the Fireplace room and the round dining room over the river. Steaks, seafood and seasonal plates, with a long wine list.
            </p>
          </div>
          <div className="media-row">
            <Image src={photos.lantern.src} alt={photos.lantern.alt} width={photos.lantern.width} height={photos.lantern.height} sizes="(max-width: 900px) 100vw, 860px" className="rounded grow" style={{ width: '100%', height: 'clamp(320px, 48vw, 600px)', objectFit: 'cover' }} />
            <Image src={photos.serverWine.src} alt={photos.serverWine.alt} width={photos.serverWine.width} height={photos.serverWine.height} sizes="(max-width: 900px) 100vw, 400px" className="rounded" style={{ flex: '1 1 300px', minWidth: 0, width: '100%', height: 'clamp(320px, 48vw, 600px)', objectFit: 'cover' }} />
          </div>
          <div className="dish-grid">
            {[
              [photos.scallops, 'Seared scallops, risotto'],
              [photos.lamb, 'Herb-crusted lamb'],
              [photos.halibut, 'Halibut, chickpeas, grilled zucchini'],
              [photos.cobbler, 'Skillet cobbler, ice cream'],
            ].map(([ph, name]) => {
              const photo = ph as typeof photos.scallops;
              return (
                <figure key={name as string} className="dish">
                  <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 600px) 100vw, 300px" />
                  <figcaption>{name as string}</figcaption>
                </figure>
              );
            })}
          </div>
          <div className="btn-row">
            <a href={business.links.reserveTable} className="btn btn--amber" rel="noopener">Reserve a table</a>
            <Link href="/dine#menus" className="btn btn--ghost-cream">Dinner menu</Link>
          </div>
        </div>
      </section>

      {/* 05 APRÈS */}
      <ApresSection />
    </>
  );
}
