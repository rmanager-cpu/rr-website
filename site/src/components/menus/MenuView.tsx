import Link from 'next/link';
import { business } from '@/content/site';
import { formatTime } from '@/lib/events/recurrence';
import { priceText, TAG_LABEL, type Hours, type Menu } from '@/lib/menus/store';
import { ServingNow } from './ServingNow';

export function hoursText(h: Hours[]): string {
  return h.map((x) => `${x.label}, ${formatTime(x.start).replace(' PM', '').replace(' AM', '')}–${formatTime(x.end)}`).join(' · ');
}

/** The tab strip: every menu is a real page, so each tab is a plain link Google can follow. */
export function MenuTabs({ menus, current }: { menus: Menu[]; current?: string }) {
  return (
    <nav className="menu-tabs" aria-label="Menus">
      {menus.map((m) => (
        <Link key={m.slug} href={`/menus/${m.slug}`} aria-current={m.slug === current ? 'page' : undefined}>
          {m.name}
        </Link>
      ))}
    </nav>
  );
}

export function MenuView({ menu }: { menu: Menu }) {
  const usedTags = new Set<string>();
  let anyRaw = false;
  for (const s of menu.sections) for (const i of s.items) if (!i.hidden) { i.dish.tags.forEach((t) => usedTags.add(t)); anyRaw ||= i.dish.raw; }
  return (
    <article className="menu" aria-labelledby="menu-h">
      <header className="menu__head">
        <h2 id="menu-h" className="serif menu__title">{menu.name}</h2>
        <div className="menu__when">
          {menu.hours.length > 0 && <span>{hoursText(menu.hours)}</span>}
          {menu.servingNote && <span>{menu.servingNote}</span>}
          <ServingNow hours={menu.hours} />
        </div>
        {menu.intro && <p className="lede">{menu.intro}</p>}
      </header>
      <div className="menu__sections">
        {menu.sections.map((s) => {
          const items = s.items.filter((i) => !i.hidden);
          if (!items.length) return null;
          return (
            <section key={s.id} className="menu-section" aria-labelledby={`sec-${s.id}`}>
              <h3 id={`sec-${s.id}`} className="menu-section__name">{s.name}</h3>
              {s.note && <p className="menu-section__note">{s.note}</p>}
              <ul className="menu-items">
                {items.map((i) => (
                  <li key={i.id} className="menu-item">
                    <div className="menu-item__top">
                      <span className="menu-item__name">
                        {i.dish.signature ? <Link href={`/menus/dishes/${i.dish.slug}`}>{i.dish.name}</Link> : i.dish.name}
                        {i.dish.raw && <sup className="menu-raw" aria-label="served raw or undercooked">^</sup>}
                      </span>
                      <span className="menu-item__dots" aria-hidden="true" />
                      <span className="menu-item__price">{priceText(i.prices, i.priceNote)}</span>
                    </div>
                    {(i.description ?? i.dish.description) && <p className="menu-item__desc">{i.description ?? i.dish.description}</p>}
                    {i.dish.tags.length > 0 && (
                      <span className="menu-item__tags">
                        {i.dish.tags.map((t) => <abbr key={t} title={TAG_LABEL[t] ?? t}>{t}</abbr>)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <footer className="menu__foot">
        {usedTags.size > 0 && (
          <p>{[...usedTags].map((t) => `${t}: ${TAG_LABEL[t] ?? t}`).join(' · ')}</p>
        )}
        {anyRaw && <p>^ Served raw or undercooked, or may be. Consuming raw or undercooked meats, poultry, seafood, shellfish or eggs may increase your risk of foodborne illness.</p>}
        {menu.footer && <p>{menu.footer}</p>}
        <p>Menus and prices change with the season. Tell your server about any allergies.</p>
        <div className="btn-row">
          <a href={business.links.reserveTable} className="btn btn--amber" rel="noopener">Reserve a table</a>
          <a href={`tel:${business.phoneE164}`} className="btn btn--navy">{business.phone}</a>
        </div>
      </footer>
    </article>
  );
}
