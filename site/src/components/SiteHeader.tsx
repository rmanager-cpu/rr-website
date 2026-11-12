'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { business, sectionFor, sections, sharedNav, type NavItem } from '@/content/site';
import { ChevronDown } from './Icons';

const isCurrent = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

/** A link that leaves the site (OpenTable) is a plain <a>; the rest use Link. */
function Go({ item, className, onClick }: { item: NavItem; className?: string; onClick?: () => void }) {
  return item.href.startsWith('/') ? (
    <Link href={item.href} className={className} onClick={onClick}>{item.label}</Link>
  ) : (
    <a href={item.href} className={className} rel="noopener">{item.label}</a>
  );
}

/** The River Ranch logo in ember gold: the white logo file used as a mask over the gold (globals .brand__logo),
 *  so it always matches --amber. The link around it carries the name for screen readers. */
const Wordmark = () => <span className="brand__logo" aria-hidden="true" />;

type Props = {
  /** `overlay` floats clear over a dark full-bleed hero (.page-hero) and turns into the dark glass bar once
   *  the page scrolls; `solid` is the dark bar from the start, with a spacer so nothing hides under it. */
  variant?: 'overlay' | 'solid';
  /** Overlay only: how far down the page (in viewport heights) the header turns solid. */
  solidAfter?: number;
};

/**
 * The Fireside header: the wordmark, the three sections, "More" (the shared pages) and an amber Book
 * pill, fixed to the top. Inside a section, a slim second row shows that section's tabs and its main
 * button (on an overlay page that row floats over the hero and scrolls away with it). Phones get a
 * full-screen menu.
 */
export function SiteHeader({ variant = 'solid', solidAfter = 0.04 }: Props) {
  const path = usePathname();
  const section = sectionFor(path);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const [more, setMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreCurrent = sharedNav.some((n) => isCurrent(path, n.href));

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
    setMore(false);
  }, [path]);
  useEffect(() => {
    if (!more) return;
    const onDown = (e: MouseEvent) => !moreRef.current?.contains(e.target as Node) && setMore(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMore(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [more]);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      menuBtnRef.current?.focus();
    };
  }, [open]);
  useEffect(() => {
    if (variant !== 'overlay') return;
    let raf = 0;
    const check = () => {
      raf = 0;
      setScrolled(window.scrollY > Math.max(30, window.innerHeight * solidAfter));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [variant, solidAfter]);

  return (
    <>
      <header className={`site-header site-header--${variant}${scrolled ? ' is-scrolled' : ''}`} data-solid-after={variant === 'overlay' ? solidAfter : undefined}>
        <div className="site-header__bar">
          <Link href="/" className="brand" aria-label={`${business.name}, home`}>
            <Wordmark />
          </Link>
          <nav className="site-nav" aria-label="Main">
            {sections.map((s) => (
              <Link key={s.key} href={s.href} aria-current={path === s.href ? 'page' : section?.key === s.key ? 'true' : undefined}>
                {s.label}
              </Link>
            ))}
            <div className={`more${moreCurrent ? ' is-current' : ''}`} ref={moreRef}>
              <button type="button" className="more__btn" aria-expanded={more} aria-controls="more-menu" onClick={() => setMore((v) => !v)}>
                More <ChevronDown size={12} />
              </button>
              <ul id="more-menu" className="more__menu" hidden={!more}>
                {sharedNav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} aria-current={path === n.href ? 'page' : undefined} onClick={() => setMore(false)}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <Link href={business.links.bookRoom} className="btn btn--sm site-header__book">
            Book
          </Link>
          <button ref={menuBtnRef} type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
            <span>Menu</span>
            <i aria-hidden="true" />
          </button>
        </div>

        <div id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
          <div className="mobile-menu__top">
            <Link href="/" className="brand" aria-label={`${business.name}, home`} onClick={() => setOpen(false)}>
              <Wordmark />
            </Link>
            <button ref={closeRef} type="button" className="menu-btn menu-btn--close" onClick={() => setOpen(false)}>
              <span>Close</span>
              <i aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Main (menu)">
            <Link href="/" className="mm-top" aria-current={path === '/' ? 'page' : undefined}>Home</Link>
            {sections.map((s) => (
              <div key={s.key} className="mm-group">
                <Link href={s.href} className="mm-top" aria-current={path === s.href ? 'page' : undefined}>{s.label}</Link>
                <ul className="mm-sub">
                  {s.tabs.map((t) => (
                    <li key={t.href}><Link href={t.href} aria-current={path === t.href ? 'page' : undefined}>{t.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <ul className="mobile-menu__more">
            {sharedNav.map((n) => (
              <li key={n.href}><Link href={n.href} aria-current={path === n.href ? 'page' : undefined}>{n.label}</Link></li>
            ))}
          </ul>
          <div className="mobile-menu__foot">
            <div className="btn-row">
              <Link href={business.links.bookRoom} className="btn">Book a room</Link>
              <a href={business.links.reserveTable} className="btn btn--ghost" rel="noopener">Reserve a table</a>
            </div>
            <a href={`tel:${business.phoneE164}`}>{business.phone}</a>
          </div>
        </div>
      </header>
      {variant === 'solid' && <div className="site-header-spacer" aria-hidden="true" />}

      {section && (
        <nav className={`section-tabs section-tabs--${section.key}${variant === 'overlay' ? ' section-tabs--overlay' : ''}`} aria-label={`${section.label} pages`}>
          <div className="container section-tabs__inner">
            <Link href={section.href} className="section-tabs__home" aria-current={path === section.href ? 'page' : undefined}>
              {section.label}
            </Link>
            <ul className="section-tabs__list">
              {section.tabs.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} aria-current={path === t.href ? 'page' : isCurrent(path, t.href) ? 'true' : undefined}>
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Go item={section.action} className="btn btn--sm section-tabs__action" />
          </div>
        </nav>
      )}
    </>
  );
}
