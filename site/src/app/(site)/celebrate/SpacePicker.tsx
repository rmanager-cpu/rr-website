'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, type KeyboardEvent } from 'react';
import type { Photo } from '@/content/photos';

export type PickerSpace = {
  /** The name in two parts: plain, then the italic accent ("Riverview" + "room"). */
  lead: string;
  em: string;
  text: string;
  /** Where it is (or when it's open). */
  place: string;
  /** The confirmed capacity, or null for "ask us". */
  fits: string | null;
  photo: Photo;
};

/**
 * "Pick your room": the four event spaces as a list of big serif names. Hovering, focusing or clicking a
 * row wipes its photo onto a sticky stage beside the list (desktop); on phones each row shows its own
 * photo. Arrow keys move between rows.
 */
export function SpacePicker({ items }: { items: PickerSpace[] }) {
  const [state, setState] = useState({ on: 0, prev: -1 });
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const show = (i: number) => setState((s) => (s.on === i ? s : { on: i, prev: s.on }));
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = items.length;
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % n;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i + n - 1) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    buttons.current[next]?.focus();
  };
  const capacity = (s: PickerSpace) => s.fits ?? 'Capacity: ask us';
  const cur = items[state.on];

  return (
    <div className="cel-spaces">
      <div>
        <ol className="cel-spaces__list">
          {items.map((s, i) => (
            <li key={s.lead + s.em} className={`cel-space${state.on === i ? ' is-active' : ''}`} onMouseEnter={() => show(i)}>
              <div className="cel-space__head">
                <h3 className="cel-space__name">
                  <button
                    ref={(el) => { buttons.current[i] = el; }}
                    type="button"
                    aria-pressed={state.on === i}
                    onFocus={() => show(i)}
                    onClick={() => show(i)}
                    onKeyDown={(e) => onKey(e, i)}
                  >
                    {s.lead} <em>{s.em}</em>
                  </button>
                </h3>
                <p className="cel-space__note">{s.text}</p>
                <div className="chip-row">
                  <span className="chip chip--plain">{s.place}</span>
                  <span className={`chip ${s.fits ? 'chip--food' : 'chip--plain'}`}>{capacity(s)}</span>
                </div>
              </div>
              <figure className="frame frame--wide cel-space__photo" data-reveal="clip">
                <Image src={s.photo.src} alt={s.photo.alt} fill sizes="(max-width: 860px) 100vw, 1px" />
              </figure>
            </li>
          ))}
        </ol>
        <p className="cel-spaces__more">
          <Link href="/celebrate/spaces" className="link-arrow">More on the spaces</Link>
        </p>
      </div>
      <div className="cel-spaces__stage" aria-hidden="true" data-reveal>
        <div className="cel-spaces__screen">
          {items.map((s, i) => (
            <Image
              key={s.lead + s.em}
              src={s.photo.src}
              alt=""
              fill
              sizes="(max-width: 860px) 1px, 80vw"
              className={state.on === i ? 'is-active' : state.prev === i ? 'is-prev' : undefined}
            />
          ))}
        </div>
        <p className="cel-spaces__cap">
          <span>{cur.lead} {cur.em}</span>
          <span>{capacity(cur)}</span>
        </p>
      </div>
    </div>
  );
}
