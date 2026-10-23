import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hoursText, MenuTabs, MenuView } from '@/components/menus/MenuView';
import { SiteHeader } from '@/components/SiteHeader';
import { breadcrumbSchema, JsonLd, menuSchema } from '@/lib/schema';
import { listMenus } from '@/lib/menus/store';

export const revalidate = 300;

export async function generateStaticParams() {
  return (await listMenus()).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const m = (await listMenus()).find((x) => x.slug === params.slug);
  if (!m) return {};
  const dishes = m.sections.flatMap((s) => s.items.filter((i) => !i.hidden).map((i) => i.dish.name)).slice(0, 5).join(', ');
  const when = m.hours.length ? `, ${hoursText(m.hours)}` : m.servingNote ? `, ${m.servingNote.toLowerCase()}` : '';
  return {
    title: `${m.name} Menu`,
    description: `${m.name} at River Ranch in Tahoe City${when}: ${dishes} and more.`.slice(0, 160),
    alternates: { canonical: `/menus/${m.slug}` },
  };
}

export default async function MenuPage({ params }: { params: { slug: string } }) {
  const menus = await listMenus();
  const menu = menus.find((m) => m.slug === params.slug);
  if (!menu) notFound();
  return (
    <>
      <JsonLd data={breadcrumbSchema(`${menu.name} menu`, `/menus/${menu.slug}`)} />
      <JsonLd data={menuSchema(menu)} />
      <SiteHeader />
      <section className="section" style={{ paddingBottom: 20 }}>
        <div className="container stack" style={{ gap: 20 }}>
          <span className="eyebrow">Menus</span>
          <h1 className="sr-only">{menu.name} menu at River Ranch, Tahoe City</h1>
          <MenuTabs menus={menus} current={menu.slug} />
        </div>
      </section>
      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <MenuView menu={menu} />
        </div>
      </section>
    </>
  );
}
