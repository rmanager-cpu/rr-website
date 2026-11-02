import Link from 'next/link';
import { dbReady } from '@/lib/db/pool';
import { appearances, listMenus, priceText, type Menu } from '@/lib/menus/store';
import { hoursText } from '@/components/menus/MenuView';
import { newEventMenuAction } from '../../actions';
import { NewEventMenu } from '../../MenuForms';

function MenuTable({ menus }: { menus: Menu[] }) {
  return (
    <div className="adm-card tbl">
      <table>
        <thead><tr><th>Menu</th><th>Served</th><th>Dishes</th><th /></tr></thead>
        <tbody>
          {menus.map((m) => (
            <tr key={m.id}>
              <td style={{ fontWeight: 700 }}>{m.name}{m.slug.endsWith('-template') ? <span className="tag" style={{ marginLeft: 8 }}>template</span> : !m.active && m.kind !== 'banquet' && <span className="tag" style={{ marginLeft: 8 }}>hidden</span>}</td>
              <td>{m.hours.length ? hoursText(m.hours) : m.servingNote ?? m.intro ?? '—'}</td>
              <td>{m.sections.reduce((n, s) => n + s.items.filter((i) => !i.hidden).length, 0)}</td>
              <td><Link href={`/admin/menus/${m.slug}`}>Edit</Link> · <Link href={`/admin/print/menus/${m.slug}`}>Print or send</Link>{m.active && m.kind !== 'banquet' && <> · <a href={`/dine/menus/${m.slug}`} target="_blank">View</a></>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function MenusAdmin() {
  const ready = await dbReady();
  const menus = await listMenus({ includeInactive: true });
  const seen = appearances(menus);
  // Dishes whose prices differ between menus (often a stale copy).
  const mismatches = [...seen.entries()]
    .filter(([, list]) => new Set(list.map((l) => priceText(l.prices, l.priceNote))).size > 1)
    .map(([id, list]) => ({ id, name: menus.flatMap((m) => m.sections.flatMap((s) => s.items)).find((i) => i.dish.id === id)!.dish.name, list }));
  return (
    <>
      <h1>Menus</h1>
      {!ready && <p className="note">Showing the starting menus. Editing switches on once the database is connected.</p>}
      <MenuTable menus={menus.filter((m) => m.kind === 'regular')} />

      <h2>Holiday menus</h2>
      <p className="help">On the website while switched on, with prices you set for each one. A “show until” date hides it automatically afterward.</p>
      <MenuTable menus={menus.filter((m) => m.kind === 'holiday')} />
      <div className="adm-card"><NewEventMenu action={newEventMenuAction.bind(null, 'holiday')} label="New holiday menu" /></div>

      <h2>Banquet menus</h2>
      <p className="help">Three courses with your own heading and subheading, for printing and sending to guests. Never on the website, never priced.</p>
      <MenuTable menus={menus.filter((m) => m.kind === 'banquet')} />
      <div className="adm-card"><NewEventMenu action={newEventMenuAction.bind(null, 'banquet')} label="New banquet menu" /></div>

      {mismatches.length > 0 && (
        <div className="adm-card">
          <h2>Prices that don’t match across menus ({mismatches.length})</h2>
          <p className="help">Same dish, different price on different menus. Sometimes that’s on purpose (happy hour), often it’s a stale copy.</p>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
            {mismatches.map((m) => (
              <li key={m.id}><strong>{m.name}</strong>: {m.list.map((l) => `${l.menu} ${priceText(l.prices, l.priceNote)}`).join(' · ')}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
