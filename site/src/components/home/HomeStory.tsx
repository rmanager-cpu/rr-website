'use client';

import Image from 'next/image';
import Link from 'next/link';
import localFont from 'next/font/local';
import { useEffect, useRef, useState } from 'react';
import { L } from '@/content/lorem';
import { homePhotos as ph, type Photo } from '@/content/photos';
import { business, fullAddress, hours, lodging } from '@/content/site';
import { SiteHeader } from '../SiteHeader';
import { startStory } from './story';
import './home.css';

/*
 * The homepage: one sticky scroll story in three acts (hero -> Stay -> Dine -> Celebrate), then Visit.
 * Design reference: prototypes/home-scroll on the prototype/home-scroll branch.
 *
 * Everything (headings, copy, photos with alt text, links) is plain server-rendered HTML, so search
 * engines read the whole story without scrolling; ./story.ts only moves and fades it. Only the hero
 * photo and fonts load up front: every other story photo sits in a display:none layer (so the browser
 * doesn't fetch it) until the visitor scrolls or the page has finished loading.
 */

// Home-only fonts, self-hosted, swapped in without blocking text. Preloaded only on this page.
const brush = localFont({ src: '../../fonts/knewave-latin-400-normal.woff2', weight: '400', display: 'swap', variable: '--hs-brush', preload: true });
const serif = localFont({ src: '../../fonts/fraunces-latin-wght-normal.woff2', weight: '100 900', display: 'swap', variable: '--hs-serif', preload: false });
const sans = localFont({ src: '../../fonts/figtree-latin-wght-normal.woff2', weight: '300 900', display: 'swap', variable: '--hs-sans', preload: true });

const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${fullAddress}`)}`;

function Pic({ p, sizes, alt, priority, className }: { p: Photo; sizes: string; alt?: string; priority?: boolean; className?: string }) {
  return <Image src={p.src} alt={alt ?? p.alt} fill sizes={sizes} priority={priority} className={className} />;
}

export function HomeStory() {
  const root = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState('');

  useEffect(() => (root.current ? startStory(root.current) : undefined), []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <div ref={root} className={`hs ${brush.variable} ${serif.variable} ${sans.variable}`}>
      <div className="hs-topband" aria-hidden="true" />
      <div className="hs-nav" data-hs="nav">
        <SiteHeader variant="overlay" />
      </div>

      <h1 className="sr-only">{business.name}, Tahoe City, California</h1>

      <section className="hs-track" data-hs="track" aria-label="Stay, Dine, Celebrate">
        <div className="hs-stage" data-hs="stage">
          <div className="hs-defer">
            <div className="hs-pano" data-hs="pano" aria-hidden="true"><Pic p={ph.panorama} alt="" sizes="100vw" /></div>
            <div className="hs-bg hs-bg--bar" data-hs="barbg"><Pic p={ph.bar} sizes="100vw" /><div className="hs-wash hs-wash--bar" data-hs="barWash" /></div>
            <div className="hs-bg hs-bg--pond" data-hs="pondbg"><Pic p={ph.ceremony} sizes="100vw" /><div className="hs-wash hs-wash--pond" data-hs="pondWash" /></div>
          </div>

          <div className="hs-frame" data-hs="frame">
            <Pic p={ph.hero} sizes="100vw" priority className="hs-frame__hero" />
            <div className="hs-defer"><Pic p={ph.entrance} sizes="(max-width: 860px) 100vw, 60vw" className="hs-frame__entrance" /></div>
            <div className="hs-frame__grade" data-hs="grade" />
          </div>

          <div className="hs-defer">
            <figure className="hs-float" data-float="skiroom"><div className="hs-float__in"><Pic p={ph.skiRoom} sizes="(max-width: 860px) 60vw, 26vw" /></div></figure>
            <div className="hs-frame2" data-hs="frame2"><Pic p={ph.dining} sizes="100vw" /></div>
            <figure className="hs-float hs-float--b" data-floatb="lamb"><div className="hs-float__in"><Pic p={ph.elk} sizes="(max-width: 860px) 52vw, 24vw" /></div></figure>
            <div className="hs-frame3" data-hs="frame3"><Pic p={ph.couple} sizes="100vw" /></div>
            <figure className="hs-float hs-float--c" data-floatc="cake"><div className="hs-float__in"><Pic p={ph.cake} sizes="(max-width: 860px) 47vw, 22vw" /></div></figure>
          </div>

          <canvas className="hs-flakes" data-hs="flakes" aria-hidden="true" />

          <ul className="hs-doors">
            <li>
              <a className="hs-door" href="#stay" data-go="stay">
                <span className="hs-door__word" data-hs="stayWord">Stay</span>
                <span className="hs-door__sub" data-fade>{L.head}</span>
              </a>
            </li>
            <li data-fade>
              <a className="hs-door" href="#dine" data-go="dine">
                <span className="hs-door__word">Dine</span>
                <span className="hs-door__sub">{L.head2}</span>
              </a>
            </li>
            <li data-fade>
              <a className="hs-door" href="#celebrate" data-go="celebrate">
                <span className="hs-door__word">Celebrate</span>
                <span className="hs-door__sub">{L.head3}</span>
              </a>
            </li>
          </ul>
          <div className="hs-cue" data-hs="cue" aria-hidden="true" />

          <div className="hs-copy hs-copy--stay" data-hs="stayCopy">
            <h2 className="sr-only" id="stay">Stay</h2>
            <span className="hs-copy__slot" data-hs="staySlot" aria-hidden="true">Stay</span>
            <p className="hs-copy__sub">{L.head}</p>
            <p>{L.line}</p>
            <div className="hs-copy__actions">
              <Link className="btn btn--amber" href="/stay">Check Out the Lodge</Link>
            </div>
          </div>

          <div className="hs-copy hs-copy--dine" data-hs="dineCopy">
            <h2 className="hs-copy__word hs-copy__word--dine" id="dine">Dine</h2>
            <p className="hs-copy__sub">{L.head2}</p>
            <p>{L.line2}</p>
            <div className="hs-copy__actions">
              <Link className="btn hs-btn--cream" href="/dine">Check Out the Restaurant</Link>
            </div>
            <p className="hs-today">
              Dinner {hours.dinner.days.toLowerCase()}, {hours.dinner.time} · Happy hour Mon–Fri, {hours.happyHour.time}
            </p>
          </div>

          <div className="hs-copy hs-copy--cel" data-hs="celCopy">
            <h2 className="hs-copy__word" id="celebrate">Celebrate</h2>
            <p className="hs-copy__sub">{L.head3}</p>
            <p>{L.line3}</p>
            <div className="hs-copy__actions">
              <Link className="btn btn--amber" href="/celebrate">Plan Your Event</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hs-visit" id="visit" aria-labelledby="visit-hours">
        <div className="hs-visit__inner">
          <div>
            <h2 id="visit-hours">Hours</h2>
            <dl className="hs-hours">
              <dt>{hours.dinner.label}</dt>
              <dd>{hours.dinner.days} · {hours.dinner.time}</dd>
              <dt>{hours.happyHour.label}</dt>
              <dd>Mon–Fri · {hours.happyHour.time}, at the bar</dd>
              <dt>{hours.breakfast.label}</dt>
              <dd>Sat &amp; Sun · {hours.breakfast.time}</dd>
              <dt>Lodge</dt>
              <dd>Check-in {lodging.checkIn} · check-out {lodging.checkOut}</dd>
            </dl>
          </div>
          <div>
            <h2>Find Us</h2>
            <address>
              {business.name}
              <br />
              {business.address.street}
              <br />
              {business.address.city}, {business.address.region} {business.address.postalCode}
              <br />
              <a href={`tel:${business.phoneE164}`}>{business.phone}</a>
            </address>
            <div className="hs-visit__links">
              <a className="hs-link" href={MAPS} target="_blank" rel="noopener">Get Directions</a>
              <Link className="hs-link" href="/history">Our Story</Link>
              <Link className="hs-link" href="/visit#gift-cards">Gift Cards</Link>
              <Link className="hs-link" href="/loyalty">Loyalty</Link>
              <Link className="hs-link" href="/careers">Careers</Link>
            </div>
          </div>
          <form
            className="hs-signup"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              setToast('Email sign-up isn’t connected yet. Follow along on Instagram in the meantime.');
            }}
          >
            <h2>Stay in the Loop</h2>
            <p>{L.line2}</p>
            <div className="hs-signup__row">
              <label className="sr-only" htmlFor="hs-email">Email address</label>
              <input id="hs-email" type="email" placeholder="you@example.com" autoComplete="email" />
              <button className="btn btn--amber" type="submit">Sign Up</button>
            </div>
          </form>
        </div>
      </section>

      <div className={`hs-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">{toast}</div>

      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <filter id="hs-rough" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}
