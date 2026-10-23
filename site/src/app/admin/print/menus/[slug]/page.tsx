import { notFound } from 'next/navigation';
import { hoursText } from '@/components/menus/MenuView';
import { business } from '@/content/site';
import { requireAdmin } from '@/lib/admin/session';
import { listMenus, priceText, TAG_LABEL } from '@/lib/menus/store';
import { PrintControls } from './PrintControls';
import './print.css';

// Printable menu, laid out from the same data as the website: staff fill in dishes and prices in the
// menu editor; this page arranges them on the paper, shrinks to fit one page, and stamps the date.
// Staff-only. Template: "classic" (cream paper, serif heads, boxed section names), until the house
// template arrives.

export const dynamic = 'force-dynamic';

const SIZES = {
  letter: { label: 'Letter 8.5 × 11', w: '8.5in', h: '11in' },
  legal: { label: 'Legal 8.5 × 14', w: '8.5in', h: '14in' },
  tabloid: { label: 'Tabloid 11 × 17', w: '11in', h: '17in' },
  half: { label: 'Half page 5.5 × 8.5', w: '5.5in', h: '8.5in' },
} as const;
type Size = keyof typeof SIZES;

export default async function PrintMenu({ params, searchParams }: { params: { slug: string }; searchParams: { size?: string; cols?: string; hide?: string } }) {
  requireAdmin();
  const menu = (await listMenus({ includeInactive: true })).find((m) => m.slug === params.slug);
  if (!menu) notFound();
  const size: Size = (Object.keys(SIZES) as Size[]).includes(searchParams.size as Size) ? (searchParams.size as Size) : 'letter';
  const cols = Math.min(3, Math.max(1, Number(searchParams.cols) || (size === 'half' ? 1 : 2)));
  const hidden = new Set((searchParams.hide ?? '').split(',').filter(Boolean));
  const sections = menu.sections
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.hidden) }))
    .filter((s) => s.items.length && !hidden.has(s.id));

  const tags = new Set<string>();
  let raw = false;
  for (const s of sections) for (const i of s.items) { i.dish.tags.forEach((t) => tags.add(t)); raw ||= i.dish.raw; }
  const printed = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());

  return (
    <div className="pm-shell">
      <PrintControls
        sizes={Object.entries(SIZES).map(([k, v]) => ({ value: k, label: v.label }))}
        size={size}
        cols={cols}
        sections={menu.sections.map((s) => ({ id: s.id, name: s.name, on: !hidden.has(s.id) }))}
        backHref={`/admin/menus/${menu.slug}`}
      />
      <style>{`@page { size: ${SIZES[size].w} ${SIZES[size].h}; margin: 0; }`}</style>
      <div className="pm-page" data-size={size} style={{ width: SIZES[size].w, height: SIZES[size].h }}>
        <div className="pm-fit" id="pm-fit">
          <header className="pm-head">
            <div className="pm-name">{menu.name} Menu</div>
            <div className="pm-house">{business.name}</div>
            {(menu.hours.length > 0 || menu.servingNote) && <div className="pm-when">{menu.hours.length ? hoursText(menu.hours) : menu.servingNote}</div>}
            {menu.intro && <p className="pm-intro">{menu.intro}</p>}
          </header>
          <main className="pm-body" style={{ columnCount: cols }}>
            {sections.map((s) => (
              <section key={s.id} className="pm-section">
                <h2 className="pm-section-name">{s.name}</h2>
                {s.note && <p className="pm-note">{s.note}</p>}
                {s.items.map((i) => {
                  const price = priceText(i.prices, i.priceNote).replace(/$/g, '');
                  const long = price.length > 16;
                  return (
                  <div key={i.id} className="pm-item">
                    <div className={long ? 'pm-line pm-line--stack' : 'pm-line'}>
                      <span className="pm-dish">
                        {i.dish.name}
                        {i.dish.raw && <sup>^</sup>}
                        {i.dish.tags.length > 0 && <span className="pm-tags"> {i.dish.tags.join(' ')}</span>}
                      </span>
                      <span className="pm-price">{priceText(i.prices, i.priceNote).replace(/\$/g, '')}</span>
                    </div>
                    {(i.description ?? i.dish.description) && <p className="pm-desc">{i.description ?? i.dish.description}</p>}
                  </div>
                  );
                })}
              </section>
            ))}
          </main>
          <footer className="pm-foot">
            {tags.size > 0 && <p>{[...tags].map((t) => `${t} ${TAG_LABEL[t] ?? t}`).join(' · ')}</p>}
            {raw && <p>^ Consuming raw or undercooked meats, poultry, seafood, shellfish or eggs may increase your risk of foodborne illness.</p>}
            {menu.footer && <p>{menu.footer}</p>}
            <p className="pm-stamp">{business.address.street}, {business.address.city} · {business.phone} · riverranchlodge.com · Printed {printed}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
