'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { photos } from '@/content/photos';

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** The curtain moment on /stay: a dark room with an amber slit of light, then, as you scroll, the
 *  curtains part on the view from a balcony over the river. One scroll value drives all of it.
 *  The section is tall only under `html.fl-motion` (set before paint), so without JS, or
 *  with reduced motion, it is simply the photo with its caption. */
export function StayCurtain() {
  const sec = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sec.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const view = el.querySelector<HTMLElement>('.sty-curtain__view');
    const img = view?.querySelector<HTMLElement>('img');
    const slit = el.querySelector<HTMLElement>('.sty-curtain__slit');
    const night = el.querySelector<HTMLElement>('.sty-curtain__night');
    const morning = el.querySelector<HTMLElement>('.sty-curtain__morning');
    if (!view || !img || !slit || !night || !morning) return;
    let ticking = false;

    const reset = () => {
      // Clear only what draw() sets: next/image keeps its own inline styles on the img.
      view.style.clipPath = '';
      img.style.transform = '';
      [slit, night, morning].forEach((n) => {
        n.style.opacity = '';
        n.style.transform = '';
      });
    };

    const draw = () => {
      ticking = false;
      if (reduced.matches || !document.documentElement.classList.contains('fl-motion')) return reset();
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -50 || r.top > vh + 50) return;
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      const open = ease(clamp((p - 0.08) / 0.62));
      const side = (50 * (1 - open)).toFixed(2);
      view.style.clipPath = `inset(0 ${side}% 0 ${side}%)`;
      img.style.transform = `scale(${(1.22 - 0.22 * open).toFixed(3)})`;
      slit.style.opacity = (1 - clamp(p / 0.14)).toFixed(2);
      const n = 1 - clamp((p - 0.04) / 0.22);
      night.style.opacity = n.toFixed(2);
      night.style.transform = `translateY(calc(-50% - ${((1 - n) * 40).toFixed(1)}px))`;
      const m = ease(clamp((p - 0.62) / 0.24));
      morning.style.opacity = m.toFixed(2);
      morning.style.transform = `translateY(${((1 - m) * 36).toFixed(1)}px)`;
    };
    const request = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(draw);
      }
    };

    draw();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    reduced.addEventListener('change', request);
    return () => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      reduced.removeEventListener('change', request);
    };
  }, []);

  const photo = photos.balconySnowyRiver;
  return (
    <section ref={sec} className="sty-curtain" aria-label="The view from a room">
      <div className="sty-curtain__stage grain">
        <div className="sty-curtain__view">
          <Image src={photo.src} alt={photo.alt} fill sizes="100vw" />
        </div>
        <span className="sty-curtain__slit" aria-hidden="true" />
        <div className="sty-curtain__night" aria-hidden="true">
          <p className="label label--accent">Still dark. Stay in bed.</p>
          <p className="display-l">Open <em>the curtains.</em></p>
        </div>
        <div className="sty-curtain__morning container">
          <p className="label">Good morning. It snowed.</p>
          <h2 className="display-l">There’s <em>the river.</em></h2>
        </div>
      </div>
    </section>
  );
}
