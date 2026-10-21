'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { business, nav } from '@/content/site';
import { Close, Menu } from './Icons';

/** Logo, main menu and Book button. `overlay` sits on a hero photo (light text); `solid` sits on ice. */
export function SiteHeader({ variant = 'solid', extra }: { variant?: 'overlay' | 'solid'; extra?: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [path]);
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
          <Link href="/visit">Visit</Link>
        </nav>
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
