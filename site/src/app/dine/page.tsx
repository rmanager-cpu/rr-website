import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business, hours } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Tahoe City Restaurant & Bar',
  description:
    'Dinner nightly from 5 PM by the stone fireplace, happy hour Monday to Friday 3–5 PM at the round bar, and weekend breakfast on the Truckee River in Tahoe City.',
  alternates: { canonical: '/dine' },
};

// Dish names from the current menus. Prices and full menus come from the staff editor once it exists,
// so this page never shows a stale price.
const DINNER = ['Seared scallops over risotto', 'Herb-crusted lamb', 'Halibut with chickpeas and grilled zucchini', 'Prime top sirloin', 'Ranch Stroganoff', 'Ahi poke', 'Brussels sprouts & shishitos', 'Skillet cobbler with ice cream'];
const HAPPY = ['Soup of the day', 'Brussels sprouts & shishitos', 'Alpine poutine', 'Chophouse burger', 'Caesar salad', 'Wings', 'Famous ranch nachos', 'Fries'];
const BREAKFAST = ['Steak & eggs', 'Eggs Benedict', 'Biscuits & gravy', 'House granola', 'Bloody Marys'];

function MenuList({ id, title, when, items, note }: { id: string; title: string; when: string; items: string[]; note?: string }) {
  return (
    <section id={id} className="stack" style={{ gap: 14 }} aria-labelledby={`${id}-h`}>
      <h3 id={`${id}-h`} className="serif" style={{ fontSize: 34, lineHeight: 1.05 }}>{title}</h3>
      <p className="muted" style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{when}</p>
      <ul className="list-dots">{items.map((i) => <li key={i}>{i}</li>)}</ul>
      {note && <p className="muted" style={{ margin: 0, fontSize: 14 }}>{note}</p>}
    </section>
  );
}

export default function DinePage() {
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
            <p className="lede" style={{ maxWidth: 460 }}>A few favorites from the current menus. The full menus change with the season.</p>
          </div>
          <div className="card-grid" style={{ gap: 48 }}>
            <MenuList id="dinner" title="Dinner" when={`${hours.dinner.days}, ${hours.dinner.time}`} items={DINNER} />
            <MenuList id="happy-hour" title="Happy hour" when={`${hours.happyHour.days}, ${hours.happyHour.time}`} items={HAPPY} note={hours.happyHour.note} />
            <MenuList id="breakfast" title="Weekend breakfast" when={`${hours.breakfast.days}, ${hours.breakfast.time}`} items={BREAKFAST} />
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
