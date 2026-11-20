import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dbReady } from '@/lib/db/pool';
import { appearances, listMenus, priceText } from '@/lib/menus/store';
import { addMenuItemAction, addSectionAction, deleteEventMenuAction, saveMenuAction, saveMenuItemAction, saveSectionAction } from '../../../actions';
import { AddItem, Fold, ItemRow, MenuSettings, SectionHead } from '../../../MenuForms';

const STYLE_NAMES: Record<string, string> = { classic: 'Classic', fireside: 'Fireside', trailhead: 'Trailhead', band: 'Band' };
const PAPER_NAMES: Record<string, string> = { letter: 'Letter paper', legal: 'Legal paper', 'half-letter': 'Half sheet' };

export default async function EditMenu({ params }: { params: { slug: string } }) {
  const ready = await dbReady();
  const menus = await listMenus({ includeInactive: true });
  const menu = menus.find((m) => m.slug === params.slug);
  if (!menu) notFound();
  const seen = appearances(menus);
  const banquet = menu.kind === 'banquet';
  const template = menu.slug.endsWith('-template');
  const event = menu.kind !== 'regular';
  const settingsLine = [
    banquet ? 'Print only, never on the site' : menu.active ? (menu.showUntil ? `On the site until ${new Date(`${menu.showUntil}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'On the site') : 'Hidden from the site',
    `${STYLE_NAMES[menu.print?.theme ?? 'classic'] ?? 'Classic'} style`,
    PAPER_NAMES[menu.print?.size ?? 'letter'] ?? 'Letter',
  ].join(' · ');
  return (
    <>
      <div className="row-actions" style={{ justifyContent: 'space-between' }}>
        <h1>{menu.name}</h1>
        <div className="row-actions"><Link href="/admin/menus">← All menus</Link><Link href={`/admin/print/menus/${menu.slug}`} className="btn btn--sm btn--navy">Print or send</Link>{!banquet && menu.active && <a href={`/dine/menus/${menu.slug}`} target="_blank">View on the site →</a>}</div>
      </div>
      {template && <p className="note">This is the template. New {menu.kind} menus start as a copy of it, so changes here only affect future menus.</p>}
      {!ready && <p className="note">The menu database isn’t connected yet, so changes can’t save.</p>}
      <p className="help">A dish’s name, description and tags are shared: change them here and they change on every menu the dish is on. Prices are just for this menu.</p>

      {/* One box per section: the section's name opens its own editor, then a tidy list of dishes. Tap a dish
          and its editor opens right under it; one thing open at a time. */}
      {menu.sections.map((s) => (
        <section key={s.id} className="adm-card mi-sec">
          <Fold
            className="mi-fold--sec"
            summary={
              <>
                <span className="mi-sum__main"><span className="mi-sec__name">{s.name}</span>{s.note && <span className="mi-sum__desc">{s.note}</span>}</span>
                <span className="mi-sum__side"><span className="mi-sum__count">{s.items.length === 1 ? '1 dish' : `${s.items.length} dishes`}</span><span className="mi-sum__edit">Edit</span></span>
              </>
            }
          >
            <SectionHead action={saveSectionAction.bind(null, s.id, menu.slug)} name={s.name} note={s.note ?? ''} sort={s.sort} />
          </Fold>
          {s.items.length > 0 && (
            <ul className="mi-list">
              {s.items.map((i) => {
                const mine = priceText(i.prices, i.priceNote);
                const others = (seen.get(i.dish.id) ?? []).filter((o) => o.menu !== menu.name);
                const mismatch = others.some((o) => priceText(o.prices, o.priceNote) !== mine);
                const description = i.description ?? i.dish.description ?? '';
                const tags = [...i.dish.tags, ...(i.dish.raw ? ['^'] : [])];
                return (
                  <li key={i.id} className={i.hidden ? 'is-hidden' : undefined}>
                    <Fold
                      summary={
                        <>
                          <span className="mi-sum__main"><span className="mi-sum__name">{i.dish.name}</span>{description && <span className="mi-sum__desc">{description}</span>}</span>
                          <span className="mi-sum__side">
                            {tags.length > 0 && <span className="mi-sum__tags">{tags.join(' ')}</span>}
                            {i.hidden && <span className="tag">Hidden</span>}
                            {!banquet && mine && <span className="mi-sum__price">{mine}</span>}
                          </span>
                        </>
                      }
                    >
                      <ItemRow
                        noPrices={banquet}
                        action={saveMenuItemAction.bind(null, i.id, menu.slug)}
                        init={{
                          name: i.dish.name,
                          description,
                          tags: i.dish.tags,
                          raw: i.dish.raw,
                          prices: i.prices.map((p) => (p.label ? `${p.label} ${p.price}` : String(p.price))).join(' / '),
                          priceNote: i.priceNote ?? '',
                          hidden: i.hidden,
                          sort: i.sort,
                          elsewhere: others.map((o) => `${o.menu} ${priceText(o.prices, o.priceNote)}`).join(' · '),
                          mismatch,
                        }}
                      />
                    </Fold>
                  </li>
                );
              })}
            </ul>
          )}
          <Fold className="mi-fold--add" summary={<span className="mi-sum__add">+ Add a dish</span>}>
            <AddItem noPrices={banquet} action={addMenuItemAction.bind(null, s.id, menu.slug)} />
          </Fold>
        </section>
      ))}

      <form action={addSectionAction.bind(null, menu.id, menu.slug)} className="adm-card mi-newsec">
        <div className="row-actions"><input type="text" name="name" placeholder="New section, like Starters" aria-label="New section name" maxLength={120} required style={{ flex: 1 }} /><button type="submit" className="btn btn--sm btn--navy">Add section</button></div>
      </form>

      <section className="adm-card mi-sec">
        <Fold
          group="mi-settings"
          className="mi-fold--sec"
          summary={
            <>
              <span className="mi-sum__main"><span className="mi-sec__name">{event ? 'Heading and settings' : 'Menu settings'}</span><span className="mi-sum__desc">{settingsLine}</span></span>
              <span className="mi-sum__side"><span className="mi-sum__edit">Edit</span></span>
            </>
          }
        >
          <MenuSettings
            action={saveMenuAction.bind(null, menu.id, menu.slug)}
            init={{ name: menu.name, intro: menu.intro ?? '', servingNote: menu.servingNote ?? '', footer: menu.footer ?? '', active: menu.active, showUntil: menu.showUntil ?? '', theme: menu.print?.theme ?? 'classic', size: menu.print?.size ?? 'letter', kind: menu.kind, hours: menu.hours }}
          />
        </Fold>
      </section>

      {menu.kind !== 'regular' && !template && (
        <form action={deleteEventMenuAction.bind(null, menu.id)}>
          <button type="submit" className="btn btn--sm">Delete this menu</button>
        </form>
      )}
    </>
  );
}
