import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/fl/Lines';
import { hoursText, MenuTabs } from '@/components/menus/MenuView';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { listMenus } from '@/lib/menus/store';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Menus: Dinner, Happy Hour, Weekend Breakfast & Wine',
  description:
    'River Ranch menus in Tahoe City: dinner nightly 5–9 PM, happy hour Monday–Friday 3–5 PM, weekend breakfast and lunch, patio lunch in summer, desserts, cocktails and a wine list.',
  alternates: { canonical: '/dine/menus' },
};

export default async function MenusIndex() {
  const menus = await listMenus();
  return (
    <>
      <JsonLd data={breadcrumbSchema('Menus', '/dine/menus')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero page-hero--short mn-hero">
        <div className="page-hero__media">
          <Image src={photos.fireplaceTableSet.src} alt={photos.fireplaceTableSet.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Menus</p>
          <Lines as="h1" className="display-xl" lines={['From the kitchen', <em key="b">and the bar.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">Every menu we pour and plate, with prices. They change with the season, so this is the place to check.</p>
          <div className="mn-hero__tabs" data-reveal data-reveal-delay="450">
            <MenuTabs menus={menus} />
          </div>
        </div>
      </section>

      <section className="section section--snow" aria-labelledby="all-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Pick a menu</p>
            <Lines id="all-h" className="display-l" lines={['What are', <em key="h">we having?</em>]} />
          </div>
          <div className="menu-cards">
            {menus.map((m, i) => (
              <Link key={m.slug} href={`/dine/menus/${m.slug}`} className="mn-card" data-reveal data-reveal-delay={String((i % 3) * 120)}>
                <span className="mn-card__name">{m.name}</span>
                {m.hours.length > 0 && <span className="mn-card__when">{hoursText(m.hours)}</span>}
                {m.servingNote && <span className="mn-card__when">{m.servingNote}</span>}
                <span className="mn-card__dishes">
                  {m.sections.flatMap((s) => s.items.filter((it) => !it.hidden).map((it) => it.dish.name)).slice(0, 4).join(' · ')}
                </span>
                <span className="mn-card__go">See the menu</span>
              </Link>
            ))}
            <figure className="frame mn-card__photo" data-reveal="clip">
              <Image src={photos.lantern.src} alt={photos.lantern.alt} fill sizes="(max-width: 700px) 100vw, 440px" />
            </figure>
          </div>
        </div>
      </section>

      <section className="section section--dark mn-last" aria-labelledby="menus-last-h">
        <div className="container container--narrow center">
          <div className="section-head section-head--center" style={{ marginBottom: 0 }}>
            <p className="label label--accent" data-reveal>Hungry yet?</p>
            <Lines id="menus-last-h" className="display-l" lines={['Save us a seat', <em key="t">at the table.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">Tell your server about any allergies. Prices and dishes change with the season.</p>
            <div className="btn-row" style={{ justifyContent: 'center' }} data-reveal data-reveal-delay="250">
              <Link href="/dine#reserve" className="btn">Reserve a table</Link>
              <a href={`tel:${business.phoneE164}`} className="btn btn--ghost">{business.phone}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
