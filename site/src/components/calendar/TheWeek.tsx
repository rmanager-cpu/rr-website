'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { business } from '@/content/site';
import type { Day, DayEvent } from './days';
import './week.css';

/**
 * The day-by-day calendar (Fireside's "The Week", on /dine/happening): today and the days after it as big
 * numbered rows. With `initial`, only that many show at first, with a button for the rest. Each row shows the day's
 * program in one line and opens to the details: times, a short line, a chip per category, "Stay this
 * night" (the booking picker with that date filled in) and "Reserve a table". Today is open to start;
 * one day is open at a time. Keyboard: Tab or the up and down arrows move between days, Enter or Space
 * opens one, Home and End jump to the first and last. On a desktop with a mouse, a photo of the day
 * follows the cursor over the closed rows.
 */

// Headline order: the music first, then the specials, then happy hour, the regular hours last.
const rank = (e: DayEvent) => (e.music ? 0 : e.regular ? (e.title === 'Dinner' ? 9 : 8) : e.category === 'happy-hour' ? 5 : 2);
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function TheWeek({ days: all, initial }: { days: Day[]; initial?: number }) {
  const [shown, setShown] = useState(initial ?? all.length);
  const days = all.slice(0, shown);
  const more = all.length - shown;
  const [open, setOpen] = useState(0);
  // Photos load only for days that have been opened, and the floating photos only once a mouse arrives.
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const [floatReady, setFloatReady] = useState(false);
  const choose = (i: number) => {
    setOpen(i);
    if (i >= 0) setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
  };
  const heads = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const float = useRef<HTMLDivElement>(null);

  // Closed panels stay in the page (so they can animate) but out of reach of Tab and screen readers.
  useEffect(() => {
    panels.current.forEach((p, i) => {
      if (!p) return;
      if (i === open) p.removeAttribute('inert');
      else p.setAttribute('inert', '');
    });
  }, [open]);

  // The floating photo over closed rows (mouse and motion only).
  useEffect(() => {
    const box = float.current;
    if (!box) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    let fx = 0, fy = 0, gx = 0, gy = 0, raf = 0;
    const loop = () => {
      fx += (gx - fx) * 0.12;
      fy += (gy - fy) * 0.12;
      const tilt = Math.max(-5, Math.min(5, (gx - fx) * 0.03));
      box.style.transform = `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      raf = Math.abs(gx - fx) + Math.abs(gy - fy) > 0.4 ? requestAnimationFrame(loop) : 0;
    };
    const hide = () => box.classList.remove('is-on');
    const cleanups: (() => void)[] = [];
    heads.current.forEach((head) => {
      if (!head) return;
      const enter = (e: MouseEvent) => {
        setFloatReady(true);
        if (head.getAttribute('aria-expanded') === 'true') return;
        const src = head.dataset.photo;
        box.querySelectorAll<HTMLElement>('[data-src]').forEach((el) => el.toggleAttribute('data-on', el.dataset.src === src));
        if (!box.classList.contains('is-on')) {
          fx = gx = Math.min(e.clientX, window.innerWidth - 340);
          fy = gy = e.clientY;
          box.style.transform = `translate3d(${fx}px, ${fy}px, 0)`;
        }
        box.classList.add('is-on');
      };
      const move = (e: MouseEvent) => {
        gx = Math.min(e.clientX, window.innerWidth - 340);
        gy = e.clientY;
        if (!raf) raf = requestAnimationFrame(loop);
      };
      head.addEventListener('mouseenter', enter);
      head.addEventListener('mousemove', move);
      head.addEventListener('mouseleave', hide);
      head.addEventListener('click', hide);
      cleanups.push(() => {
        head.removeEventListener('mouseenter', enter);
        head.removeEventListener('mousemove', move);
        head.removeEventListener('mouseleave', hide);
        head.removeEventListener('click', hide);
      });
    });
    window.addEventListener('scroll', hide, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', hide);
      cleanups.forEach((c) => c());
    };
  }, [shown]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const go = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: days.length - 1 }[e.key];
    if (go === undefined) return;
    e.preventDefault();
    heads.current[Math.max(0, Math.min(days.length - 1, go))]?.focus();
  };

  const photos = [...new Map(days.map((d) => [d.photo.src, d.photo])).values()];

  return (
    <>
      <ol className="hm-wk" aria-label={`The next ${days.length} days at River Ranch`}>
        {days.map((d, i) => {
          const isOpen = i === open;
          const names = [...d.events].sort((a, b) => rank(a) - rank(b));
          const music = d.events.filter((e) => e.music);
          // In the open list, live music leads; everything else stays in time order.
          const list = music.length ? [...music, ...d.events.filter((e) => !e.music)] : d.events;
          return (
            <li key={d.date} className={`hm-wk__row${isOpen ? ' is-open' : ''}`}>
              <button
                ref={(el) => {
                  heads.current[i] = el;
                }}
                type="button"
                id={`hm-wk-h${i}`}
                className="hm-wk__head"
                aria-expanded={isOpen}
                aria-controls={`hm-wk-p${i}`}
                data-photo={d.photo.src}
                onClick={() => choose(isOpen ? -1 : i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="hm-wk__num" aria-hidden="true">{pad(d.num)}</span>
                <span className="hm-wk__day">
                  <em>{d.weekday}</em>
                  <small>
                    <span className="sr-only">{d.title}. </span>
                    <span aria-hidden="true">{d.month}</span>
                    {i === 0 ? <> · <b>Today</b></> : i === 1 ? ' · Tomorrow' : null}
                  </small>
                </span>
                <span className="hm-wk__names">
                  {names.map((e) => (
                    <span key={e.key} className={e.music ? 'is-music' : undefined}>
                      {e.title}
                      {e.music && <span className="sr-only"> (live music)</span>}
                    </span>
                  ))}
                </span>
                <span className="hm-wk__plus" aria-hidden="true" />
              </button>

              <div
                ref={(el) => {
                  panels.current[i] = el;
                }}
                className="hm-wk__panel"
                id={`hm-wk-p${i}`}
                role="region"
                aria-labelledby={`hm-wk-h${i}`}
              >
                <div className="hm-wk__clip">
                  <div className="hm-wk__in">
                    <div>
                      <p className="hm-wk__mood">{d.mood}</p>
                      {list.length > 0 && (
                        <ul className="hm-wk__list">
                          {list.map((e) => (
                            <li key={e.key} className={e.music ? 'is-music' : undefined}>
                              <span className="hm-wk__time">{e.time}</span>
                              <div>
                                {e.href ? (
                                  <Link className="hm-wk__ename" href={e.href}>{e.title}</Link>
                                ) : (
                                  <span className="hm-wk__ename">{e.title}</span>
                                )}
                                {e.line && <p className="hm-wk__edesc">{e.line}</p>}
                                <div className="chip-row hm-wk__tags">
                                  <span className={`chip chip--${e.chip}`}>{e.chipLabel}</span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="btn-row hm-wk__actions">
                        <Link className="btn btn--ink" href={`/stay?checkin=${d.date}#book`}>Stay this night</Link>
                        <a className="btn btn--ghost" href={business.links.reserveTable} target="_blank" rel="noopener">Reserve a table</a>
                      </div>
                    </div>
                    <figure className="frame hm-wk__photo">
                      {seen.has(i) && <Image src={d.photo.src} alt={d.photo.alt} fill sizes="(max-width: 900px) 100vw, 380px" />}
                    </figure>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {more > 0 && (
        <div className="hm-wk__more">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              const first = shown;
              setShown(all.length);
              // Focus the first new day, so keyboard users land where the list grew.
              requestAnimationFrame(() => heads.current[first]?.focus());
            }}
          >
            Show the next {more % 7 === 0 ? (more === 7 ? 'week' : `${more / 7} weeks`) : `${more} days`}
          </button>
        </div>
      )}

      <div ref={float} className="hm-wk__float" aria-hidden="true">
        {photos.map((p) => (
          <div key={p.src} data-src={p.src}>
            {floatReady && <Image src={p.src} alt="" fill sizes="280px" />}
          </div>
        ))}
      </div>
    </>
  );
}
