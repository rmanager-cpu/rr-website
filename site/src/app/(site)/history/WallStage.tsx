'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Close } from '@/components/Icons';

type Props = {
  /** The wall app's address (it opens full screen there). */
  wallUrl: string;
  /** What the iframe loads. */
  src: string;
  /** The intro: eyebrow, title and one line. */
  intro: ReactNode;
  /** The approved history paragraph. */
  story: ReactNode;
};

const PHONE = '(max-width: 999px)';

/**
 * The Wall as the page: the wall app fills the screen under the header and the visitor moves along it
 * (drag, swipe, trackpad, arrow keys once it has focus). The story sits on a placard: beside the wall
 * on a wide screen (it can tuck away to a slim rail), floating over it on phones, where it tucks itself
 * into a small pill as soon as the visitor touches the wall.
 */
export function WallStage({ wallUrl, src, intro, story }: Props) {
  const [open, setOpen] = useState(true);
  const [more, setMore] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const hideRef = useRef<HTMLButtonElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);

  // On phones the placard covers part of the wall: tuck it away once the visitor reaches into the wall.
  useEffect(() => {
    const onBlur = () =>
      window.setTimeout(() => {
        if (document.activeElement === frameRef.current && window.matchMedia(PHONE).matches) {
          moved.current = false; // leave focus in the wall
          setOpen(false);
        }
      }, 0);
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

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
          <a className="chip chip--music hx-chip" href={wallUrl} target="_blank" rel="noopener">
            Know one of these photos? Tell us
          </a>
          <a className="link-arrow hx-full" href={wallUrl} target="_blank" rel="noopener">
            Open The Wall full screen
          </a>
        </div>
      </aside>

      <button ref={pillRef} type="button" className="hx-pill" hidden={open} aria-controls="hx-card" aria-expanded={open} onClick={() => toggle(true)}>
        <span>Our story</span> <ChevronRight size={16} />
      </button>

      <div className="hx-wall__stage">
        <iframe
          ref={frameRef}
          className="hx-wall__frame"
          src={src}
          title="The Wall: the old River Ranch photographs by the host stand. Drag or swipe to move along it, and tap any photo to see it up close."
          allow="fullscreen"
          allowFullScreen
        />
      </div>
    </section>
  );
}
