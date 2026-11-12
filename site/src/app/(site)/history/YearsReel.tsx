'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type Year = { year: string; tag: string; line: string };

type Props = {
  /** The label and heading over the reel. */
  head: ReactNode;
  years: Year[];
};

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/**
 * Fireside's "years" band: a tall dark section whose stage sticks under the header while the vertical
 * scroll slides the row of years sideways, the year nearest the middle brightest, and an amber bar
 * filling underneath. The tall, sticky layout only applies under html.fl-motion (set before paint when
 * motion is allowed; see globals.css), so without JS or with reduced motion the row simply scrolls
 * sideways by itself.
 */
export function YearsReel({ head, years }: Props) {
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current, stage = stageRef.current, track = trackRef.current, bar = barRef.current;
    if (!sec || !stage || !track || !bar) return;
    const root = document.documentElement;
    const items = Array.from(track.children) as HTMLElement[];
    let ticking = false;

    const reset = () => {
      track.style.transform = '';
      bar.style.transform = '';
      items.forEach((it) => (it.style.opacity = ''));
    };

    const frame = () => {
      ticking = false;
      if (!root.classList.contains('fl-motion')) return reset();
      const vh = window.innerHeight;
      const w = stage.clientWidth;
      const r = sec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = clamp(-r.top / Math.max(1, sec.offsetHeight - vh), 0, 1);
      const max = Math.max(0, track.scrollWidth - w);
      const x = p * max;
      track.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
      for (const it of items) {
        const c = it.offsetLeft + it.offsetWidth / 2 - x;
        const d = Math.abs(c - w * 0.42) / (w * 0.75);
        it.style.opacity = (1 - clamp(d, 0, 1) * 0.72).toFixed(3);
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // Fonts swapping in change the widths; the motion class can also come and go (reduced motion).
    document.fonts?.ready.then(onScroll).catch(() => {});
    const mo = new MutationObserver(onScroll);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    frame();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      mo.disconnect();
    };
  }, []);

  return (
    <section ref={secRef} className="hx-years grain" aria-labelledby="hx-years-h">
      <div ref={stageRef} className="hx-years__stage">
        <div className="container hx-years__head">{head}</div>
        <ol ref={trackRef} className="hx-years__track" tabIndex={0} aria-label="River Ranch through the years">
          {years.map((y) => (
            <li key={y.year} className="hx-year">
              <span className="hx-year__num">{y.year}</span>
              <span className="hx-year__rule" aria-hidden="true" />
              <small>{y.tag}</small>
              <p>{y.line}</p>
            </li>
          ))}
        </ol>
        <div className="hx-years__bar" aria-hidden="true">
          <i ref={barRef} />
        </div>
      </div>
    </section>
  );
}
