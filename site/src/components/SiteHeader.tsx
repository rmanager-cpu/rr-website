'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { business, moreNav, nav } from '@/content/site';
import { Close, Menu } from './Icons';

/** Logo, main menu and Book button. `overlay` sits on a hero photo (light text); `solid` sits on ice. */
export function SiteHeader({ variant = 'solid', extra }: { variant?: 'overlay' | 'solid'; extra?: ReactNode }) {
  const path = usePathname();
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
          {extra}
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path === n.href ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
          <div className="more" ref={moreRef}>
            <button type="button" className="more__btn" aria-expanded={more} aria-controls="more-menu" onClick={() => setMore((v) => !v)}>
              More <span aria-hidden="true">▾</span>
            </button>
            <ul id="more-menu" className="more__menu" hidden={!more}>
              {moreNav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} aria-current={path === n.href ? 'page' : undefined} onClick={() => setMore(false)}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href={business.links.bookRoom} className="btn btn--amber btn--sm">
            Book
          </Link>
        </nav>
        <button ref={menuBtnRef} type="button" className="menu-btn" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </div>

      <div id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <div className="mobile-menu__top">
          <span className="brand__name">River Ranch</span>
          <button ref={closeRef} type="button" className="menu-btn" style={{ display: 'inline-flex', background: 'rgba(241,231,212,.12)', color: 'var(--cream)' }} aria-label="Close menu" onClick={() => setOpen(false)}>
            <Close />
          </button>
        </div>
        <nav aria-label="Main (menu)">
          <Link href="/">Home</Link>
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <ul className="mobile-menu__more">
          {moreNav.map((n) => (
            <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
          ))}
        </ul>
        <div className="mobile-menu__foot">
          <div className="btn-row">
            <Link href={business.links.bookRoom} className="btn btn--amber">Book a room</Link>
            <a href={business.links.reserveTable} className="btn btn--ghost-cream" rel="noopener">Reserve a table</a>
          </div>
          <a href={`tel:${business.phoneE164}`} style={{ color: 'var(--cream)' }}>{business.phone}</a>
        </div>
      </div>
    </header>
  );
}
