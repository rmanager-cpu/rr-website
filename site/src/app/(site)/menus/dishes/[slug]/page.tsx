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
  return { title: d.name, description: (d.description ?? `${d.name} at River Ranch in Tahoe City.`).slice(0, 160), alternates: { canonical: `/menus/dishes/${d.slug}` } };
}

export default async function DishPage({ params }: { params: { slug: string } }) {
  const on = await find(params.slug);
  if (!on) notFound();
  const d = on[0].item.dish;
  return (
    <>
      <JsonLd data={breadcrumbSchema(d.name, `/menus/dishes/${d.slug}`)} />
      <SiteHeader />
      <section className="section">
        <div className="container media-row" style={{ gap: 48, alignItems: 'center' }}>
          <div className="grow stack" style={{ gap: 20 }}>
            <Link href={`/menus/${on[0].menu.slug}`} className="arrow-link" style={{ fontSize: 12 }}>← {on[0].menu.name} menu</Link>
            <h1 className="slash h-l">{d.name}</h1>
            {d.description && <p className="lede" style={{ whiteSpace: 'pre-line' }}>{d.description}</p>}
            <dl className="facts">
              {on.map(({ menu, item }) => (
                <div key={menu.slug}><dt>{menu.name}</dt><dd>{priceText(item.prices, item.priceNote)}</dd></div>
              ))}
              {d.tags.length > 0 && <div><dt>Good to know</dt><dd>{d.tags.map((t) => TAG_LABEL[t] ?? t).join(', ')}</dd></div>}
            </dl>
            <a href={business.links.reserveTable} className="btn btn--amber" style={{ alignSelf: 'flex-start' }} rel="noopener">Reserve a table</a>
          </div>
          {d.photo && (
            <div className="side">
              <Image src={d.photo} alt={`${d.name} at River Ranch`} width={1200} height={1200} sizes="(max-width: 900px) 100vw, 460px" className="rounded" style={{ width: '100%', height: 'auto' }} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
