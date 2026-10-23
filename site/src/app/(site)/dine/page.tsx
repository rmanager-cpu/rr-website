import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { hoursText } from '@/components/menus/MenuView';
import { SiteHeader } from '@/components/SiteHeader';
import { listMenus } from '@/lib/menus/store';
import { photos } from '@/content/photos';
import { business, hours } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Tahoe City Restaurant & Bar',
  description:
    'Dinner nightly from 5 PM by the stone fireplace, happy hour Monday to Friday 3–5 PM at the round bar, and weekend breakfast on the Truckee River in Tahoe City.',
  alternates: { canonical: '/dine' },
};

export const revalidate = 300;

export default async function DinePage() {
  const menus = await listMenus();
  return (
    <>
      <JsonLd data={breadcrumbSchema('Dine', '/dine')} />
      <SiteHeader />

      <section className="page-hero">
        <div className="page-hero__bg">
          <Image src={photos.fireplaceRoom.src} alt={photos.fireplaceRoom.alt} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="container page-hero__body">
          <h1 className="slash h-l" style={{ color: 'var(--ice)' }}>Dinner by the fire.</h1>
          <p>The restaurant and bar at River Ranch, on the Truckee River in Tahoe City. Dinner every night from 5 PM.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="hours-h">
        <div className="container stack" style={{ gap: 32 }}>
          <div className="row-split">
            <h2 id="hours-h" className="serif h-m">Hours</h2>
            <div className="btn-row">
              <a href={business.links.reserveTable} className="btn btn--amber" rel="noopener">Reserve a table</a>
              <a href={`tel:${business.phoneE164}`} className="btn btn--navy">{business.phone}</a>
            </div>
          </div>
          <dl className="facts">
            <div><dt>{hours.dinner.label}</dt><dd>{hours.dinner.days}, {hours.dinner.time}</dd></div>
            <div><dt>{hours.happyHour.label}</dt><dd>{hours.happyHour.days}, {hours.happyHour.time}<br /><span className="muted" style={{ fontSize: 14 }}>{hours.happyHour.note}</span></dd></div>
            <div><dt>{hours.breakfast.label}</dt><dd>{hours.breakfast.days}, {hours.breakfast.time}</dd></div>
          </dl>
          <p className="muted" style={{ margin: 0 }}>Hours change with the seasons. Reservations recommended for dinner.</p>
        </div>
      </section>

      <section className="section on-night" id="menus" aria-labelledby="menus-h">
        <div className="container stack" style={{ gap: 48 }}>
          <div className="row-split">
            <div className="stack">
              <span className="eyebrow">Menus</span>
              <h2 id="menus-h" className="serif h-m">From the kitchen</h2>
            </div>
            <p className="lede" style={{ maxWidth: 460 }}>Every menu, with prices. They change with the season.</p>
          </div>
          <div className="menu-cards">
            {menus.map((m) => (
              <Link key={m.slug} href={`/menus/${m.slug}`} className="ev-card">
                <span className="ev-card__title">{m.name}</span>
                {m.hours.length > 0 && <span className="ev-card__when">{hoursText(m.hours)}</span>}
                {m.servingNote && <span className="ev-card__when">{m.servingNote}</span>}
                <span className="muted" style={{ fontSize: 15 }}>{m.sections.flatMap((x) => x.items.filter((i) => !i.hidden).map((i) => i.dish.name)).slice(0, 4).join(" · ")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="bar-h">
        <div className="container media-row" style={{ gap: 48, alignItems: 'center' }}>
          <Image src={photos.roundBar.src} alt={photos.roundBar.alt} width={photos.roundBar.width} height={photos.roundBar.height} sizes="(max-width: 900px) 100vw, 760px" className="rounded grow" style={{ width: '100%', height: 'auto' }} />
          <div className="side stack">
            <span className="eyebrow">The bar</span>
            <h2 id="bar-h" className="serif h-s">A round bar under a log ceiling.</h2>
            <p className="lede">Après, happy hour and a nightcap by the fire, with a wine list of about 80 bottles from California, Oregon and Champagne.</p>
          </div>
        </div>
      </section>
    </>
  );
}
