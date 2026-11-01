'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { business, sectionFor, sections, sharedNav, type NavItem } from '@/content/site';
import { Close, Menu } from './Icons';

const isCurrent = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

/** A link that leaves the site (booking engine, OpenTable) is a plain <a>; the rest use Link. */
function Go({ item, className, onClick }: { item: NavItem; className?: string; onClick?: () => void }) {
  return item.href.startsWith('/') ? (
    <Link href={item.href} className={className} onClick={onClick}>{item.label}</Link>
  ) : (
    <a href={item.href} className={className} rel="noopener">{item.label}</a>
  );
}

/**
 * Logo, the three sections, “More” (the shared pages) and Book. Inside a section, a slim second row
 * shows that section's tabs and its main button, in the section's color from the homepage frames.
 * `overlay` sits on a hero photo (light text); `solid` is the navy bar every other page uses.
 */
export function SiteHeader({ variant = 'solid' }: { variant?: 'overlay' | 'solid' }) {
  const path = usePathname();
  const section = sectionFor(path);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const [more, setMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className={`site-header site-header--${variant}`}>
      <div className="container site-header__bar">
        <Link href="/" className="brand" aria-label={`${business.name}, home`}>
          <span className="brand__name">River Ranch</span>
          <span className="brand__tag">{business.tagline}</span>
        </Link>
        <nav className="site-nav" aria-label="Main">
          {sections.map((s) => (
            <Link key={s.key} href={s.href} aria-current={path === s.href ? 'page' : section?.key === s.key ? 'true' : undefined}>
              {s.label}
            </Link>
          ))}
          <div className="more" ref={moreRef}>
            <button type="button" className="more__btn" aria-expanded={more} aria-controls="more-menu" onClick={() => setMore((v) => !v)}>
              More <span aria-hidden="true">▾</span>
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
          <a href={business.links.bookRoom} className="btn btn--amber btn--sm" rel="noopener">
            Book
          </a>
        </nav>
        <button ref={menuBtnRef} type="button" className="menu-btn" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </div>

      {section && variant === 'solid' && (
        <nav className={`section-tabs section-tabs--${section.key}`} aria-label={`${section.label} pages`}>
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

      <div id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <div className="mobile-menu__top">
          <span className="brand__name">River Ranch</span>
          <button ref={closeRef} type="button" className="menu-btn" style={{ display: 'inline-flex', background: 'rgba(241,231,212,.12)', color: 'var(--cream)' }} aria-label="Close menu" onClick={() => setOpen(false)}>
            <Close />
          </button>
        </div>
        <nav aria-label="Main (menu)">
          <Link href="/" className="mm-top">Home</Link>
          {sections.map((s) => (
            <div key={s.key} className="mm-group">
              <Link href={s.href} className="mm-top">{s.label}</Link>
              <ul className="mm-sub">
                {s.tabs.map((t) => (
                  <li key={t.href}><Link href={t.href}>{t.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <ul className="mobile-menu__more">
          {sharedNav.map((n) => (
            <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
          ))}
        </ul>
        <div className="mobile-menu__foot">
          <div className="btn-row">
            <a href={business.links.bookRoom} className="btn btn--amber" rel="noopener">Book a room</a>
            <a href={business.links.reserveTable} className="btn btn--ghost-cream" rel="noopener">Reserve a table</a>
          </div>
          <a href={`tel:${business.phoneE164}`} style={{ color: 'var(--cream)' }}>{business.phone}</a>
        </div>
      </div>
    </header>
  );
}
