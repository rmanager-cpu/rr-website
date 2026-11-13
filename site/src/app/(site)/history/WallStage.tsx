'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Close } from '@/components/Icons';

// The Wall itself, built into the site (components/wall). It draws with the browser's own measurements,
// so it renders in the browser only; the dimmed photo behind it shows while it loads.
const WallApp = dynamic(() => import('@/components/wall/WallApp'), { ssr: false });

type Props = {
  /** The intro: eyebrow, title and one line. */
  intro: ReactNode;
  /** The approved history paragraph. */
  story: ReactNode;
};

const PHONE = '(max-width: 999px)';

/**
 * The Wall as the page: the wall fills the screen under the header and the visitor moves along it
 * (drag, swipe, trackpad, arrow keys once it has focus). The story sits on a placard: beside the wall
 * on a wide screen (it can tuck away to a slim rail), floating over it on phones, where it tucks itself
 * into a small pill as soon as the visitor touches the wall.
 */
export function WallStage({ intro, story }: Props) {
  const [open, setOpen] = useState(true);
  const [more, setMore] = useState(false);
  const hideRef = useRef<HTMLButtonElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);

  // On phones the placard covers part of the wall: tuck it away once the visitor reaches into the wall.
  const reachIn = () => {
    if (open && window.matchMedia(PHONE).matches) {
      moved.current = false; // leave focus in the wall
      setOpen(false);
    }
  };

  // Move focus with the toggle buttons (not on the first render, and not when the wall tucked it away).
  useEffect(() => {
    if (!moved.current) return;
    (open ? hideRef : pillRef).current?.focus({ preventScroll: true });
  }, [open]);

  const toggle = (next: boolean) => {
    moved.current = true;
    setOpen(next);
  };

  return (
    <section className={`hx-wall${open ? '' : ' is-tucked'}`} id="the-wall" aria-labelledby="hx-title">
      <aside className="hx-card" id="hx-card" hidden={!open} aria-label="The story">
        <button ref={hideRef} type="button" className="hx-card__hide" aria-label="Hide the story" aria-controls="hx-card" aria-expanded={open} onClick={() => toggle(false)}>
          <span className="hx-card__hide-wide"><ChevronLeft size={16} /></span>
          <span className="hx-card__hide-phone"><Close size={18} /></span>
        </button>
        <div className="hx-card__intro">{intro}</div>
        <span className="hx-card__rule" aria-hidden="true" />
        <div className={`hx-story${more ? ' is-open' : ''}`} id="hx-story">
          {story}
        </div>
        <button type="button" className="hx-more" aria-expanded={more} aria-controls="hx-story" onClick={() => setMore((v) => !v)}>
          {more ? 'Show less' : 'Read the story'}
        </button>
        <div className="hx-card__foot">
          <button type="button" className="chip chip--music hx-chip" onClick={() => toggle(false)}>
            Know one of these photos? Tap it and tell us
          </button>
        </div>
      </aside>

      <button ref={pillRef} type="button" className="hx-pill" hidden={open} aria-controls="hx-card" aria-expanded={open} onClick={() => toggle(true)}>
        <span>Our story</span> <ChevronRight size={16} />
      </button>

      <div className="hx-wall__stage" onPointerDownCapture={reachIn} onFocusCapture={reachIn}>
        <div className="hx-wall__app">
          <WallApp />
        </div>
      </div>
    </section>
  );
}
