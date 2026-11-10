import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { listMenus, priceText, TAG_LABEL } from '@/lib/menus/store';

// Signature dish pages (option B): only dishes staff mark "signature" get one, so there are no thin
// pages. Until any are marked, this route serves nothing and nothing links to it.
export const revalidate = 300;

async function find(slug: string) {
  const menus = await listMenus();
  const on = menus.flatMap((m) => m.sections.flatMap((s) => s.items.filter((i) => !i.hidden && i.dish.slug === slug && i.dish.signature).map((i) => ({ menu: m, item: i }))));
  return on.length ? on : null;
}

export async function generateStaticParams() {
  const menus = await listMenus();
  const slugs = new Set(menus.flatMap((m) => m.sections.flatMap((s) => s.items.filter((i) => i.dish.signature).map((i) => i.dish.slug))));
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const on = await find(params.slug);
  if (!on) return {};
  const d = on[0].item.dish;
  return { title: d.name, description: (d.description ?? `${d.name} at River Ranch in Tahoe City.`).slice(0, 160), alternates: { canonical: `/dine/menus/dishes/${d.slug}` } };
}

export default async function DishPage({ params }: { params: { slug: string } }) {
  const on = await find(params.slug);
  if (!on) notFound();
  const d = on[0].item.dish;
  return (
    <>
      <JsonLd data={breadcrumbSchema(d.name, `/dine/menus/dishes/${d.slug}`)} />
      <SiteHeader />
      <section className="section section--snow">
        <div className={d.photo ? 'container split' : 'container container--narrow'}>
          <div className="stack">
            <Link href={`/dine/menus/${on[0].menu.slug}`} className="link-arrow" data-reveal>
              {on[0].menu.name} menu
            </Link>
            <h1 className="display-l" data-reveal data-reveal-delay="120">{d.name}</h1>
            {d.description && <p className="lede" style={{ whiteSpace: 'pre-line' }} data-reveal data-reveal-delay="200">{d.description}</p>}
            <dl className="facts" data-reveal data-reveal-delay="300">
              {on.map(({ menu, item }) => (
                <div key={menu.slug}><dt>{menu.name}</dt><dd>{priceText(item.prices, item.priceNote)}</dd></div>
              ))}
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
    </>
  );
}
