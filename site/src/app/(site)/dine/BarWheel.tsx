'use client';

import { useEffect, useRef } from 'react';

// The round bar's wagon-wheel ceiling, drawn as sixteen amber spokes that turn slowly as the page scrolls.
const SPOKES = Array.from({ length: 16 }, (_, i) => {
  const a = (i * Math.PI) / 8;
  return { x1: Math.cos(a) * 9, y1: Math.sin(a) * 9, x2: Math.cos(a) * 97, y2: Math.sin(a) * 97 };
});

export function BarWheel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;
    const frame = () => {
      ticking = false;
      const r = (el.parentElement ?? el).getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduce ? 0.5 : Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      el.style.setProperty('--p', p.toFixed(4));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };
    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="dn-wheel" aria-hidden="true">
      <svg viewBox="-100 -100 200 200" fill="none" stroke="#e0913a" strokeWidth=".35" strokeLinecap="round">
        <circle r="97.5" />
        <circle r="90" strokeOpacity=".5" />
        <circle r="9" />
        <circle r="3.5" strokeOpacity=".6" />
        {SPOKES.map((s, i) => (
          <line key={i} x1={s.x1.toFixed(2)} y1={s.y1.toFixed(2)} x2={s.x2.toFixed(2)} y2={s.y2.toFixed(2)} />
        ))}
      </svg>
    </div>
  );
}
