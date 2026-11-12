'use client';

import { useEffect, useRef } from 'react';

/** A glass that fills with the family Cab (deep red) as it scrolls up into view. */
export function WineGlass() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;
    const frame = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (vh * 0.55)));
      el.style.setProperty('--p', p.toFixed(3));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };
    el.dataset.live = '1';
    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="wn-glass" aria-hidden="true">
      <span className="wn-glass__glow" />
      <span className="wn-glass__stream" />
      <div className="wn-glass__wine">
        <svg viewBox="0 0 120 210">
          <defs>
            <linearGradient id="wn-wg" x1="0" y1="0" x2="0" y2="1">
              <stop offset=".25" stopColor="#a8323e" />
              <stop offset=".52" stopColor="#5c1420" />
            </linearGradient>
          </defs>
          <path d="M27 12 C27 66 38 100 60 105 C82 100 93 66 93 12 Z" fill="url(#wn-wg)" />
        </svg>
      </div>
      <svg viewBox="0 0 120 210" fill="none" stroke="#efe6d6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M27 12 C27 66 38 100 60 105 C82 100 93 66 93 12" />
        <path d="M27 12 H93" strokeOpacity=".5" />
        <path d="M60 105 V190" />
        <path d="M34 196 C46 189 74 189 86 196" />
      </svg>
    </div>
  );
}
