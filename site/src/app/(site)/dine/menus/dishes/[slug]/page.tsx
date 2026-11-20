import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { hoursText } from '@/components/menus/MenuView';
import { business } from '@/content/site';
import { breadcrumbSchema, dishSchema, JsonLd } from '@/lib/schema';
import { dishHasPage, listMenus, priceText, TAG_LABEL, type Dish, type Menu, type MenuItem } from '@/lib/menus/store';

// Signature dish pages (Alex, 2026-11-20: "some of our signature dishes, and highly searched dishes"), not
// one per menu item the way Popmenu did it. A dish gets a page once staff tick "Give this dish its own page"
// in the menu editor and write its story, so every page has words the menus don't. Hidden dishes and
// switched-off menus don't count.
export const revalidate = 300;

type Spot = { menu: Menu; item: MenuItem };

async function signatureDishes() {
  const menus = await listMenus();
  const bySlug = new Map<string, Spot[]>();
  for (const menu of menus) {
    if (menu.kind === 'banquet') continue;
    for (const s of menu.sections) for (const item of s.items) {
      if (item.hidden || !dishHasPage(item.dish)) continue;
      bySlug.set(item.dish.slug, [...(bySlug.get(item.dish.slug) ?? []), { menu, item }]);
    }
  }
  return bySlug;
}

const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const summary = (d: Dish) => {
  const first = paragraphs(d.story ?? '')[0] ?? d.description ?? `${d.name} at River Ranch in Tahoe City.`;
  return first.length > 158 ? `${first.slice(0, 157).replace(/\s+\S*$/, '')}…` : first;
};

export async function generateStaticParams() {
  return [...(await signatureDishes()).keys()].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const spots = (await signatureDishes()).get(params.slug);
  if (!spots) return {};
  const d = spots[0].item.dish;
  return {
    title: `${d.name} in Tahoe City`,
    description: summary(d),
    alternates: { canonical: `/dine/menus/dishes/${d.slug}` },
    ...(d.photo ? { openGraph: { images: [d.photo] } } : {}),
  };
}

export default async function DishPage({ params }: { params: { slug: string } }) {
  const all = await signatureDishes();
  const spots = all.get(params.slug);
  if (!spots) notFound();
  const d = spots[0].item.dish;
  const line = spots[0].item.description ?? d.description;
  const others = [...all.values()].map((s) => s[0].item.dish).filter((o) => o.slug !== d.slug).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <JsonLd data={breadcrumbSchema(d.name, `/dine/menus/dishes/${d.slug}`)} />
      <JsonLd data={dishSchema(d, spots[0].item.prices, summary(d))} />
      <SiteHeader />
      <section className="section section--snow">
        <div className={d.photo ? 'container split' : 'container container--narrow'}>
          <div className="stack">
            <Link href={`/dine/menus/${spots[0].menu.slug}`} className="link-arrow" data-reveal>
              {spots[0].menu.name} menu
            </Link>
            <h1 className="display-l" data-reveal data-reveal-delay="120">{d.name}</h1>
            {line && <p className="lede" data-reveal data-reveal-delay="200">{line}</p>}
            <div className="prose" data-reveal data-reveal-delay="250">
              {paragraphs(d.story ?? '').map((p, i) => <p key={i} style={{ whiteSpace: 'pre-line' }}>{p}</p>)}
            </div>
            <dl className="facts" data-reveal data-reveal-delay="300">
              {spots.map(({ menu, item }) => {
                const when = menu.hours.length ? hoursText(menu.hours) : menu.servingNote;
                return (
                  <div key={menu.slug}>
                    <dt><Link href={`/dine/menus/${menu.slug}`}>{menu.name}</Link></dt>
                    <dd>{priceText(item.prices, item.priceNote)}{when ? <><br /><span className="muted">{when}</span></> : null}</dd>
                  </div>
                );
              })}
              {d.tags.length > 0 && <div><dt>Good to know</dt><dd>{d.tags.map((t) => TAG_LABEL[t] ?? t).join(', ')}</dd></div>}
            </dl>
            <div className="btn-row" data-reveal data-reveal-delay="300">
              <Link href="/dine#reserve" className="btn">Reserve a table</Link>
              <a href={`tel:${business.phoneE164}`} className="btn btn--ghost">{business.phone}</a>
            </div>
          </div>
          {d.photo && (
            <figure className="frame frame--square" data-reveal="clip">
              <Image src={d.photo} alt={`${d.name} at River Ranch`} fill priority sizes="(max-width: 860px) 100vw, 45vw" />
            </figure>
          )}
        </div>
      </section>
      {others.length > 0 && (
        <section className="section">
          <div className="container stack">
            <h2 className="display-s">More River Ranch favorites</h2>
            <div className="btn-row">
              {others.map((o) => <Link key={o.slug} href={`/dine/menus/dishes/${o.slug}`} className="link-arrow">{o.name}</Link>)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
