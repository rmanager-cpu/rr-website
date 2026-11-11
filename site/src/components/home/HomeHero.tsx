'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { business } from '@/content/site';

/*
 * The home hero: night on the Truckee turning into first light as you scroll. A tall track holds a
 * sticky stage; one scroll value (--p, 0 to 1) drives every layer: the photo drifts and warms, the
 * night tint lifts, a dawn glow rises from the horizon, two canvas layers of snow keep falling, and the
 * three buttons arrive. The words are just the name and "Lodge & Restaurant".
 * At the end the bottom of the scene fades away (a mask, --o) to show the faded Palisades photo the
 * site already paints behind every page (SeasonWash), so morning settles straight into the page.
 */

type SnowOpts = { density: number; rMin: number; rMax: number; vMin: number; vMax: number; aMin: number; aMax: number; sway: number; wind: number; maxDpr: number };
type Flake = { x: number; y: number; r: number; v: number; a: number; s: number; sw: number };

function snow(canvas: HTMLCanvasElement, o: SnowOpts) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let flakes: Flake[] = [];
  const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
  const make = (anywhere: boolean): Flake => ({
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : -10,
    r: o.rMin + Math.random() * (o.rMax - o.rMin),
    v: o.vMin + Math.random() * (o.vMax - o.vMin),
    a: o.aMin + Math.random() * (o.aMax - o.aMin),
    s: Math.random() * 6.28,
    sw: 8 + Math.random() * o.sway,
  });
  const size = () => {
    const nw = canvas.clientWidth;
    const nh = canvas.clientHeight;
    const widthChanged = nw !== w;
    w = nw;
    h = nh;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    // A phone's address bar showing or hiding changes only the height: keep the flakes falling.
    if (widthChanged || !flakes.length) flakes = Array.from({ length: Math.round((o.density * w * h) / 100000) }, () => make(true));
  };
  const draw = (dt: number, t: number) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.y += f.v * dt;
      if (f.y > h + 10) {
        flakes[i] = make(false);
        continue;
      }
      const x = f.x + Math.sin(t * 0.0006 + f.s) * f.sw + o.wind * f.y * 0.05;
      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.arc(((x % w) + w) % w, f.y, f.r, 0, 6.2832);
      ctx.fill();
    }
  };
  size();
  return { size, draw };
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function HomeHero() {
  const hero = useRef<HTMLElement>(null);
  const far = useRef<HTMLCanvasElement>(null);
  const near = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = hero.current;
    if (!el || !far.current || !near.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let onScreen = true;
    let ticking = 0;

    const frame = () => {
      ticking = 0;
      const r = el.getBoundingClientRect();
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = clamp(-r.top / total);
      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--o', clamp((p - 0.6) * 2.6).toFixed(4));
      el.classList.toggle('is-waking', p > 0.22);
      el.classList.toggle('is-morning', p > 0.6);
      onScreen = r.bottom > 0;
    };
    const request = () => {
      if (!ticking) ticking = requestAnimationFrame(frame);
    };

    const a = snow(far.current, { density: 16, rMin: 0.6, rMax: 1.7, vMin: 14, vMax: 34, aMin: 0.35, aMax: 0.9, sway: 14, wind: 0.6, maxDpr: 2 });
    const b = snow(near.current, { density: 3.2, rMin: 2.4, rMax: 5.6, vMin: 46, vMax: 92, aMin: 0.3, aMax: 0.75, sway: 30, wind: 1.4, maxDpr: 1 });
    const resize = () => {
      a.size();
      b.size();
      request();
    };

    let last = 0;
    let loop = 0;
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      if (onScreen && !document.hidden) {
        a.draw(dt, t);
        b.draw(dt, t);
      }
      // Reduced motion: draw the snow once and hold it still.
      if (!reduce) loop = requestAnimationFrame(tick);
    };
    loop = requestAnimationFrame(tick);

    frame();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(loop);
      cancelAnimationFrame(ticking);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section ref={hero} className="hm-hero" aria-label="River Ranch at first light">
      <div className="hm-hero__stage">
        <div className="hm-hero__scene">
          <div className="hm-hero__photo">
            <Image
              src="/photos/home/lodge-snow-blue-hour.jpg"
              alt="River Ranch lodge under deep snow at blue hour, lights glowing along the porch"
              fill
              priority
              sizes="100vw"
              quality={80}
            />
          </div>
          <div className="hm-hero__night" />
          <div className="hm-hero__glow" />
          <div className="hm-hero__dawn" />
          <div className="hm-hero__sky" />
          <canvas ref={far} className="hm-hero__snow hm-hero__snow--far" aria-hidden="true" />
          <canvas ref={near} className="hm-hero__snow hm-hero__snow--near" aria-hidden="true" />
        </div>
        <div className="hm-hero__copy">
          <h1 className="hm-hero__name">
            River <em>Ranch</em>
            <span className="sr-only">, {business.tagline.replace('&', 'and')}</span>
          </h1>
          <p className="hm-hero__sub" aria-hidden="true">Lodge &amp; Restaurant</p>
        </div>
        <div className="hm-hero__actions">
          <Link className="btn btn--primary" href="/stay#book">Book a room</Link>
          <a className="btn btn--light" href={business.links.reserveTable} target="_blank" rel="noopener">Reserve a table</a>
          <Link className="btn btn--light" href="/celebrate/plan">Plan an event</Link>
        </div>
      </div>
    </section>
  );
}
