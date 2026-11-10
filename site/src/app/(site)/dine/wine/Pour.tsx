'use client';

import { useEffect, useRef } from 'react';

/** "Poured here.": the words fill with deep red from the bottom up as they scroll into view. */
export function Pour() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const word = ref.current;
    const fill = word?.querySelector<HTMLElement>('.wn-pour__fill');
    if (!word || !fill) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    word.dataset.live = '1';
    let ticking = false;
    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const draw = () => {
      ticking = false;
      const r = word.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = clamp((vh * 0.92 - r.top) / (vh * 0.62));
      const f = clamp((p - 0.2) / 0.8);
      fill.style.clipPath = `inset(${((1 - f) * 100).toFixed(2)}% 0 0 0)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(draw);
      }
    };
    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <h2 ref={ref} id="pour-h" className="display-xl wn-pour__word" aria-label="Poured here.">
      <span className="wn-pour__base" aria-hidden="true">Poured <em>here.</em></span>
      <span className="wn-pour__fill" aria-hidden="true">Poured <em>here.</em></span>
    </h2>
  );
}
