import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { hoursText, MenuTabs } from '@/components/menus/MenuView';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { listMenus } from '@/lib/menus/store';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Menus: Dinner, Happy Hour, Weekend Breakfast & Wine',
  description:
    'River Ranch menus in Tahoe City: dinner nightly 5–9 PM, happy hour Monday–Friday 3–5 PM, weekend breakfast and lunch, patio lunch in summer, desserts, cocktails and a wine list.',
  alternates: { canonical: '/menus' },
};

export default async function MenusIndex() {
  const menus = await listMenus();
  return (
    <>
      <JsonLd data={breadcrumbSchema('Menus', '/menus')} />
      <SiteHeader />
      <section className="section" style={{ paddingBottom: 30 }}>
        <div className="container stack" style={{ gap: 22 }}>
          <span className="eyebrow">Menus</span>
          <h1 className="slash h-l">From the kitchen and the bar.</h1>
          <MenuTabs menus={menus} />
        </div>
      </section>
      <section className="section bg-frost" style={{ paddingTop: 50 }}>
        <div className="container menu-cards">
          {menus.map((m) => (
            <Link key={m.slug} href={`/menus/${m.slug}`} className="ev-card">
              <span className="ev-card__title">{m.name}</span>
              {m.hours.length > 0 && <span className="ev-card__when">{hoursText(m.hours)}</span>}
              {m.servingNote && <span className="ev-card__when">{m.servingNote}</span>}
              <span className="muted" style={{ fontSize: 15 }}>
                {m.sections.flatMap((s) => s.items.filter((i) => !i.hidden).map((i) => i.dish.name)).slice(0, 4).join(' · ')}
              </span>
            </Link>
          ))}
          <figure className="figure">
            <Image src={photos.lantern.src} alt={photos.lantern.alt} width={photos.lantern.width} height={photos.lantern.height} sizes="(max-width: 700px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto' }} />
          </figure>
        </div>
      </section>
    </>
  );
}
