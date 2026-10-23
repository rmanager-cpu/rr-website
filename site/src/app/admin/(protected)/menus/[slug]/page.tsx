import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dbReady } from '@/lib/db/pool';
import { appearances, listMenus, priceText } from '@/lib/menus/store';
import { addMenuItemAction, addSectionAction, saveMenuAction, saveMenuItemAction, saveSectionAction } from '../../../actions';
import { AddItem, ItemRow, MenuSettings, SectionHead } from '../../../MenuForms';

export default async function EditMenu({ params }: { params: { slug: string } }) {
  const ready = await dbReady();
  const menus = await listMenus({ includeInactive: true });
  const menu = menus.find((m) => m.slug === params.slug);
  if (!menu) notFound();
  const seen = appearances(menus);
  return (
    <>
      <div className="row-actions" style={{ justifyContent: 'space-between' }}>
        <h1>{menu.name}</h1>
        <div className="row-actions"><Link href="/admin/menus">← All menus</Link><Link href={`/admin/print/menus/${menu.slug}`} className="btn btn--sm btn--navy">Print menu</Link><a href={`/menus/${menu.slug}`} target="_blank">View on the site →</a></div>
      </div>
      {!ready && <p className="note">The menu database isn’t connected yet, so changes can’t save.</p>}
      <p className="help">A dish’s name, description and tags are shared: change them here and they change on every menu the dish is on. Prices are just for this menu.</p>

      {menu.sections.map((s) => (
        <section key={s.id} className="adm-card">
          <SectionHead action={saveSectionAction.bind(null, s.id, menu.slug)} name={s.name} note={s.note ?? ''} sort={s.sort} />
          {s.items.map((i) => {
            const mine = priceText(i.prices, i.priceNote);
            const others = (seen.get(i.dish.id) ?? []).filter((o) => o.menu !== menu.name);
            return (
              <ItemRow
                key={i.id}
                action={saveMenuItemAction.bind(null, i.id, menu.slug)}
                init={{
                  name: i.dish.name,
                  description: i.description ?? i.dish.description ?? '',
                  tags: i.dish.tags,
                  raw: i.dish.raw,
                  prices: i.prices.map((p) => (p.label ? `${p.label} ${p.price}` : String(p.price))).join(' / '),
                  priceNote: i.priceNote ?? '',
                  hidden: i.hidden,
                  sort: i.sort,
                  elsewhere: others.map((o) => `${o.menu} ${priceText(o.prices, o.priceNote)}`).join(' · '),
                  mismatch: others.some((o) => priceText(o.prices, o.priceNote) !== mine),
                }}
              />
            );
          })}
          <AddItem action={addMenuItemAction.bind(null, s.id, menu.slug)} />
        </section>
      ))}

      <form action={addSectionAction.bind(null, menu.id, menu.slug)} className="adm-card">
        <h2>Add a section</h2>
        <div className="row-actions"><input type="text" name="name" placeholder="Starters" maxLength={120} required style={{ flex: 1 }} /><button type="submit" className="btn btn--sm btn--navy">Add section</button></div>
      </form>

      <MenuSettings
        action={saveMenuAction.bind(null, menu.id, menu.slug)}
        init={{ name: menu.name, intro: menu.intro ?? '', servingNote: menu.servingNote ?? '', footer: menu.footer ?? '', active: menu.active, showUntil: menu.showUntil ?? '', hours: menu.hours }}
      />
    </>
  );
}
