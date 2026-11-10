import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { hoursText } from '@/components/menus/MenuView';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { listMenus, type Menu } from '@/lib/menus/store';
import { listSeries } from '@/lib/events/store';
import { holidayDates } from '@/lib/events/recurrence';
import { homePhotos, photos } from '@/content/photos';
import { business, hours } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { BarWheel } from './BarWheel';
import { DayLine, type Seg } from './DayLine';
import { OpenTableWidget } from './OpenTable';
import { PlatesPin } from './Plates';
import { OPENTABLE_BOOKING } from './reserve-links';
import './dine.css';

export const metadata: Metadata = {
  title: 'Tahoe City Restaurant & Bar',
  description:
    'Dinner nightly from 5 PM by the stone fireplace, happy hour Monday to Friday 3–5 PM at the round bar, and weekend breakfast on the Truckee River in Tahoe City.',
  alternates: { canonical: '/dine' },
};

export const revalidate = 300;

const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** "17:00" -> "5", "11:30" -> "11:30": the big hour numbers. */
const hourNum = (t: string) => {
  const h = Number(t.slice(0, 2)) % 12 || 12;
  const m = t.slice(3, 5);
  return m === '00' ? String(h) : `${h}:${m}`;
};

/** Each service on the day line, from the staff menu editor's hours (site.ts hours if none are set). */
function dayViews(menus: Menu[]): Record<'weekdays' | 'weekends', Seg[]> {
  const build = (days: number[], weekend: boolean) => {
    const out: Seg[] = [];
    for (const m of menus) {
      for (const h of m.hours) {
        if (!h.days.some((d) => days.includes(d))) continue;
        if (out.some((s) => h.start < s.end && h.end > s.start)) continue; // one service per stretch of the day
        const hh = m.slug === 'happy-hour';
        const name = weekend ? m.name.replace(/^weekend\s+/i, '') : m.name;
        out.push({ label: sentence(name), start: h.start, end: h.end, kind: hh ? 'hh' : h.start >= '16:00' ? 'pm' : 'am', hh });
      }
    }
    return out.sort((a, b) => a.start.localeCompare(b.start));
  };
  const views = { weekdays: build([1, 2, 3, 4, 5], false), weekends: build([6, 7], true) };
  if (!views.weekdays.length || !views.weekends.length) {
    const dinner: Seg = { label: 'Dinner', start: hours.dinner.opens, end: hours.dinner.closes, kind: 'pm' };
    return {
      weekdays: [{ label: 'Happy hour', start: hours.happyHour.opens, end: hours.happyHour.closes, kind: 'hh', hh: true }, dinner],
      weekends: [{ label: 'Breakfast', start: hours.breakfast.opens, end: hours.breakfast.closes, kind: 'am' }, dinner],
    };
  }
  return views;
}

/** A few plates: the sideways course. Lines come from each photo's own description. */
const PLATES = [
  { p: homePhotos.elk, name: <>Elk <em>chops</em></>, line: 'Roasted potatoes, radish and cherries.' },
  { p: photos.scallops, name: <>Seared <em>scallops</em></>, line: 'Over risotto.' },
  { p: photos.halibut, name: <>The <em>halibut</em></>, line: 'Over chickpeas and grilled zucchini.', tall: true },
  { p: photos.lamb, name: <>Herb-crusted <em>lamb</em></>, line: null },
  { p: photos.cobbler, name: <>Skillet <em>cobbler</em></>, line: 'With ice cream. Told you.' },
];

export default async function DinePage() {
  const [menus, series] = await Promise.all([listMenus(), listSeries()]);
  const views = dayViews(menus);
  const all = [...views.weekdays, ...views.weekends];
  const from = all.reduce((x, s) => (s.start < x ? s.start : x), '23:59');
  const to = all.reduce((x, s) => (s.end > x ? s.end : x), '00:00');
  const holidays = [...holidayDates(series)];

  const menu = (slug: string) => menus.find((m) => m.slug === slug);
  const lunch = menu('weekend-lunch');
  const primeRib = series.some((s) => s.status === 'published' && s.repeat === 'weekly' && s.weekdays.includes(4) && /prime rib/i.test(s.title));

  const cards = [
    { title: 'Weekend breakfast', when: `${hours.breakfast.days}, ${hours.breakfast.time}`, start: hours.breakfast.opens, end: hours.breakfast.closes, chip: 'Weekends', chipCls: 'chip--lodge', line: 'Eggs, coffee and a Bloody Mary, if it was that kind of night.', menu: menu('weekend-breakfast') },
    ...(lunch && lunch.hours.length
      ? [{ title: 'Weekend lunch', when: hoursText(lunch.hours), start: lunch.hours[0].start, end: lunch.hours[0].end, chip: 'Weekends', chipCls: 'chip--lodge', line: 'Lunch by the river, between runs or instead of them.', menu: lunch }]
      : []),
    { title: 'Happy hour', when: `${hours.happyHour.days}, ${hours.happyHour.time}`, start: hours.happyHour.opens, end: hours.happyHour.closes, chip: 'Weekdays', chipCls: 'chip--music', line: 'At the round bar. Dine-in only, and not on holidays.', menu: menu('happy-hour') },
    { title: 'Dinner', when: `${hours.dinner.days}, ${hours.dinner.time}`, start: hours.dinner.opens, end: hours.dinner.closes, chip: 'Nightly', chipCls: 'chip--food', line: primeRib ? 'The lights come on at five. Thursday is Prime Rib Night.' : 'The lights come on at five.', menu: menu('dinner') },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema('Dine', '/dine')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero dn-hero">
        <div className="page-hero__media">
          <Image src={homePhotos.dining.src} alt={homePhotos.dining.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Dine</p>
          <Lines as="h1" className="display-xl" lines={['Dinner on', <em key="r">the river.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">
            Candles, white tablecloths, snow against the glass. Dinner {hours.dinner.days.toLowerCase()}, <span style={{ whiteSpace: 'nowrap' }}>{hours.dinner.time}</span>. Start at the round bar. Everybody does.
          </p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <a href="#reserve" className="btn">Reserve a table</a>
            <Link href="/dine/menus" className="btn btn--ghost">Menus</Link>
            <Link href="/dine/happening" className="btn btn--ghost">See what’s on</Link>
          </div>
        </div>
      </section>

      {/* Hours, on snow: the day line, then each service */}
      <section className="section section--snow" id="hours" aria-labelledby="hours-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>The hours</p>
            <Lines id="hours-h" className="display-l" lines={['A day at the ranch,', <em key="s">start to finish.</em>]} />
          </div>
          <DayLine views={views} from={from} to={to} holidays={holidays} />
          <div className={`dn-hours${cards.length === 4 ? ' dn-hours--4' : ''}`}>
            {cards.map((c, i) => (
              <div key={c.title} className="dn-hours__item" data-reveal data-reveal-delay={String(i * 130)}>
                <span className="fact__num">
                  {hourNum(c.start)} <em>to</em> {hourNum(c.end)}
                </span>
                <h3>{c.title}</h3>
                <p className="label">{c.when}</p>
                <p className="muted">{c.line}</p>
                <p className="dn-hours__foot">
                  <span className={`chip ${c.chipCls}`}>{c.chip}</span>
                  {c.menu && <Link href={`/dine/menus/${c.menu.slug}`} className="link-arrow">The menu</Link>}
                </p>
              </div>
            ))}
          </div>
          <p className="small dn-note" data-reveal>Hours change with the seasons. Dinner reservations are a good idea, especially on weekends and holidays.</p>
        </div>
      </section>

      {/* A few plates: scrolling down drives a slow sideways course */}
      <PlatesPin>
        <div className="dn-plates__stage">
          <div className="container dn-plates__head">
            <div>
              <p className="label label--accent">From the kitchen</p>
              <h2 id="plates-h" className="display-m">A few <em>plates.</em></h2>
              <p className="dn-plates__lede">Mountain cooking with its shirt tucked in. <span className="placeholder">[One line from the kitchen about this winter’s menu]</span></p>
            </div>
            <p className="label">Keep scrolling. Dessert is at the end.</p>
          </div>
          <div className="dn-plates__bar" aria-hidden="true"><i /></div>
          <div className="dn-plates__scroller">
            <div className="dn-plates__track">
              {PLATES.map(({ p, name, line, tall }) => (
                <article key={p.src} className={`dn-plate${tall ? ' dn-plate--tall' : ''}`}>
                  <figure className="frame">
                    <Image src={p.src} alt={p.alt} fill sizes={tall ? '(max-width: 700px) 62vw, 24vw' : '(max-width: 700px) 76vw, 33vw'} />
                  </figure>
                  <h3>{name}</h3>
                  {line && <p>{line}</p>}
                </article>
              ))}
              <div className="dn-plate dn-plate--end">
                <h3 className="display-m">Hungry <em>yet?</em></h3>
                {primeRib && <p>Thursday is Prime Rib Night.</p>}
                <div className="btn-row">
                  <a href="#reserve" className="btn">Reserve a table</a>
                  <Link href="/dine/menus" className="btn btn--ghost">Menus</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PlatesPin>

      {/* The menus, straight from the staff menu editor */}
      <section className="section section--snow" id="menus" aria-labelledby="menus-h">
        <div className="container">
          <div className="section-head dn-menus__head">
            <div className="stack">
              <p className="label label--accent" data-reveal>Menus</p>
              <Lines id="menus-h" className="display-l" lines={['Every menu,', <em key="p">prices and all.</em>]} />
            </div>
            <p className="lede" data-reveal data-reveal-delay="150">They change with the season, and this is where they change first.</p>
          </div>
          <ul className="dn-menus">
            {menus.map((m, i) => {
              const dishes = m.sections.flatMap((x) => x.items.filter((it) => !it.hidden).map((it) => it.dish.name)).slice(0, 4);
              return (
                <li key={m.slug} data-reveal data-reveal-delay={String((i % 4) * 90)}>
                  <Link href={`/dine/menus/${m.slug}`} className="dn-menu">
                    <span className="dn-menu__name">{m.name}</span>
                    <span className="dn-menu__when">{m.hours.length > 0 ? hoursText(m.hours) : m.servingNote ?? ''}</span>
                    <span className="dn-menu__dishes">{dishes.join(' · ')}</span>
                    <span className="dn-menu__go" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Reserve a table: OpenTable's own widget, with a plain link that always works */}
      <section className="section section--frost" id="reserve" aria-labelledby="reserve-h">
        <div className="container split split--top dn-reserve">
          <div className="stack-l">
            <p className="label label--accent" data-reveal>Reserve a table</p>
            <Lines id="reserve-h" className="display-m" lines={['Book it, then come', <em key="e">early for the bar.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">Tables are booked through OpenTable. A big group, or something to celebrate? Give us a call.</p>
            <ul className="fl-facts" data-reveal data-reveal-delay="250">
              <li><span>Dinner</span><span>{hours.dinner.days}, {hours.dinner.time}</span></li>
              <li><span>Call the restaurant</span><span><a href={`tel:${business.phoneE164}`}>{business.phone}</a></span></li>
              <li><span>Private dinners</span><span><Link href="/celebrate" className="text-link">Celebrate at River Ranch</Link></span></li>
            </ul>
          </div>
          <div className="panel panel--light dn-reserve__card" data-reveal data-reveal-delay="150">
            <p className="label">Book on OpenTable</p>
            <OpenTableWidget />
            <a href={OPENTABLE_BOOKING} className="btn btn--ink dn-reserve__link" rel="noopener">Reserve on OpenTable</a>
          </div>
        </div>
      </section>

      {/* The round bar */}
      <section className="section section--ember dn-bar" id="bar" aria-labelledby="bar-h">
        <BarWheel />
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>The round bar</p>
            <Lines id="bar-h" className="display-l" lines={['Pull up a stool.', <>It’s round, so there’s <em key="n">no bad one.</em></>]} />
          </div>
          <figure className="frame dn-round" data-reveal="clip">
            <Image src={homePhotos.bar.src} alt={homePhotos.bar.alt} fill sizes="(max-width: 1400px) 100vw, 1320px" />
          </figure>
          <div className="dn-bar__copy">
            <div className="stack">
              <p className="lede" data-reveal>A circle of stools under a wagon-wheel ceiling of timber. Come in off the mountain and thaw.</p>
              <p className="muted" data-reveal data-reveal-delay="120">Johanson Family Wine is the owners’ own label, and we pour it here.</p>
              <p data-reveal data-reveal-delay="200"><Link href="/dine/wine" className="link-arrow">Meet the wine</Link></p>
            </div>
            <div className="dn-bar__happy" data-reveal data-reveal-delay="150">
              <p className="label label--accent">Happy hour</p>
              <span className="fact__num">{hourNum(hours.happyHour.opens)} <em>to</em> {hourNum(hours.happyHour.closes)}</span>
              <p className="muted">{hours.happyHour.days}, at the round bar. Dine-in, not on holidays.</p>
              <div className="btn-row">
                {menu('happy-hour') && <Link href="/dine/menus/happy-hour" className="btn">Happy hour menu</Link>}
                <Link href="/dine/happening" className="btn btn--ghost">See what’s on</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekend breakfast, on frost */}
      <section className="section section--frost dn-breakfast" aria-labelledby="bfast-h">
        <div className="container split">
          <figure className="frame frame--tall frame--arch" data-reveal="clip">
            <Image src={photos.breakfast.src} alt={photos.breakfast.alt} fill sizes="(max-width: 860px) 100vw, 460px" />
          </figure>
          <div className="stack">
            <p className="label label--accent" data-reveal>{hours.breakfast.days}</p>
            <Lines id="bfast-h" className="display-l" lines={['Breakfast,', <em key="k">the slow kind.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">{hours.breakfast.time}. Eggs, coffee and a Bloody Mary. Then go find some snow.</p>
            <div className="btn-row" data-reveal data-reveal-delay="250">
              {menu('weekend-breakfast') && <Link href="/dine/menus/weekend-breakfast" className="btn btn--ink">Breakfast menu</Link>}
              <Link href="/dine/happening" className="btn btn--ghost">See what’s on</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="dn-come grain" aria-labelledby="last-h">
        <div className="dn-come__media">
          <Image src={photos.lantern.src} alt={photos.lantern.alt} fill sizes="100vw" data-parallax="0.1" />
        </div>
        <div className="container">
          <p className="label label--accent" data-reveal>Tonight</p>
          <Lines id="last-h" className="display-xl" lines={['Your table’s', <em key="w">by the window.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="150">Dinner {hours.dinner.days.toLowerCase()}, {hours.dinner.time}. Book it, then come early for the bar.</p>
          <div className="btn-row" data-reveal data-reveal-delay="250">
            <a href="#reserve" className="btn">Reserve a table</a>
            <Link href="/dine/menus" className="btn btn--ghost">Menus</Link>
            <Link href="/dine/happening" className="btn btn--ghost">See what’s on</Link>
            <Link href="/dine/wine" className="link-arrow">Johanson Family Wine</Link>
          </div>
        </div>
      </section>
    </>
  );
}
