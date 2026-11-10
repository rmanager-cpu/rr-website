'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * "A few plates": the section pins while you scroll, and the scroll drives the plates sideways (with an
 * amber progress rule above them). Without JS, or with reduced motion, the row simply scrolls sideways
 * by swipe or trackpad.
 */
export function PlatesPin({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = ref.current;
    if (!sec || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const track = sec.querySelector<HTMLElement>('.dn-plates__track');
    const bar = sec.querySelector<HTMLElement>('.dn-plates__bar i');
    if (!track || !bar) return;
    let dist = 0;
    let ticking = false;
    sec.classList.add('is-pinned');

    const draw = () => {
      ticking = false;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      let p = -r.top / Math.max(1, r.height - vh);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const measure = () => {
      dist = Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
      sec.style.height = `${window.innerHeight + dist}px`;
      draw();
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(draw);
      }
    };
    measure();
    // Photos arriving late can change the track's width.
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      sec.classList.remove('is-pinned');
      sec.style.height = '';
      track.style.transform = '';
    };
  }, []);

  return (
    <section ref={ref} className="dn-plates grain" id="plates" aria-labelledby="plates-h">
      {children}
    </section>
  );
}
