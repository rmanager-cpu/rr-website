'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const REVEAL = '[data-reveal]';
const PARALLAX = '[data-parallax]';

/** How long each reveal kind runs (globals.css, Fireside motion), so we know when it is finished. */
const DURATION: Record<string, number> = { lines: 1400, clip: 1800 };

/** data-reveal-delay: "1".."9" are 120ms steps (older pages); anything larger is milliseconds (Fireside). */
const delayMs = (v: string | undefined) => {
  const n = Number(v) || 0;
  return n > 0 && n < 10 ? n * 120 : n;
};

/**
 * Fireside motion, mounted once in the public layout.
 *  - Scroll reveal. `data-reveal` rises 30px and fades in over 1.2s as it enters the viewport;
 *    `data-reveal="fade"` only fades; `="lines"` raises masked lines one after another (render them with
 *    <Lines> from ./Lines); `="clip"` wipes a photo frame open from the bottom; `="line"` draws a rule.
 *    `data-reveal-delay="150"` (ms) or "1".."4" (120ms steps) staggers it.
 *    Content is hidden only under `html.fl-motion` (set before paint by the root layout, and removed if
 *    this script never arrives), so without JS or with reduced motion everything simply shows. Revealed
 *    elements get `data-revealed="in"`, then `"done"`; className is never touched, so React re-renders
 *    never undo a reveal.
 *  - Parallax. `data-parallax="0.15"` drifts an element against the scroll, measured from its parent
 *    (put it on the photo inside a frame or hero media box).
 *  - Drag galleries. A `.drag-gallery` scrolls sideways by mouse drag too (touch and trackpads scroll it
 *    natively).
 * It re-scans on every route change and watches the DOM for content that arrives later.
 */
export function Motion() {
  const path = usePathname();
  const rescan = useRef<() => void>();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cleanups: (() => void)[] = [];

    // Mouse drag for .drag-gallery (works with or without reduced motion).
    let drag: { el: HTMLElement; x: number; left: number; moved: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>('.drag-gallery');
      if (!el) return;
      drag = { el, x: e.clientX, left: el.scrollLeft, moved: 0 };
      el.classList.add('is-dragging');
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      drag.el.scrollLeft = drag.left - dx;
    };
    const onUp = () => {
      if (!drag) return;
      const d = drag;
      d.el.classList.remove('is-dragging');
      // Swallow the click that ends a real drag, so a dragged link does not open.
      if (d.moved > 6) {
        const stop = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        d.el.addEventListener('click', stop, { capture: true, once: true });
        window.setTimeout(() => d.el.removeEventListener('click', stop, { capture: true }), 0);
      }
      drag = null;
    };
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    cleanups.push(() => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    });

    if (reduced.matches || typeof IntersectionObserver === 'undefined') {
      root.classList.remove('fl-motion');
      return () => cleanups.forEach((c) => c());
    }

    // Was motion switched on before the first paint (root layout)? If so, whatever is on screen now is
    // still hidden and rises in. If not (the safety timer fired first), on-screen content stays put.
    const preArmed = root.classList.contains('fl-motion');
    root.classList.add('fl-live');

    const watched = new Set<Element>();
    const timers = new Set<number>();
    let parallax: HTMLElement[] = [];
    let ticking = false;

    const finish = (el: HTMLElement) => {
      el.dataset.revealed = 'in';
      const kind = el.dataset.reveal ?? '';
      const lines = kind === 'lines' ? el.querySelectorAll('.rl').length : 0;
      const t = window.setTimeout(() => {
        timers.delete(t);
        el.dataset.revealed = 'done';
      }, delayMs(el.dataset.revealDelay) + (DURATION[kind] ?? 1200) + lines * 130 + 200);
      timers.add(t);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          watched.delete(e.target);
          finish(e.target as HTMLElement);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );

    const arm = (el: Element, settle: boolean) => {
      if (!(el instanceof HTMLElement) || el.dataset.revealed || watched.has(el)) return;
      const d = delayMs(el.dataset.revealDelay);
      if (d) el.style.setProperty('--d', `${d}ms`);
      if (settle && el.getBoundingClientRect().top < window.innerHeight) {
        el.dataset.revealed = 'done';
        return;
      }
      watched.add(el);
      io.observe(el);
    };

    const frame = () => {
      ticking = false;
      const vh = window.innerHeight;
      // Safety net for very fast scrolls: an element that jumped past the viewport between two observer
      // checks never "intersects", so reveal anything whose top is already above the fold line.
      for (const el of watched) {
        if (el.getBoundingClientRect().top < vh * 0.92) {
          io.unobserve(el);
          watched.delete(el);
          finish(el as HTMLElement);
        }
      }
      for (const el of parallax) {
        const box = (el.parentElement ?? el).getBoundingClientRect();
        if (box.bottom < -200 || box.top > vh + 200) continue;
        const speed = parseFloat(el.dataset.parallax ?? '');
        const offset = (box.top + box.height / 2 - vh / 2) * (Number.isNaN(speed) ? 0.15 : speed) * -1;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    };
    const request = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };

    const scan = (settle = false) => {
      // Forget elements that left with the previous page.
      for (const el of watched) {
        if (!el.isConnected) {
          io.unobserve(el);
          watched.delete(el);
        }
      }
      document.querySelectorAll(REVEAL).forEach((el) => arm(el, settle));
      parallax = Array.from(document.querySelectorAll<HTMLElement>(PARALLAX));
      request();
    };

    scan(!preArmed);
    let arming = 0;
    if (!preArmed) {
      // Turn motion on without animating anything out: transitions stay off for two frames.
      root.classList.add('fl-motion', 'fl-arming');
      arming = requestAnimationFrame(() => {
        arming = requestAnimationFrame(() => root.classList.remove('fl-arming'));
      });
    }
    rescan.current = () => scan(false);

    const mo = new MutationObserver((records) => {
      let found = false;
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n instanceof Element && (n.matches(REVEAL) || n.matches(PARALLAX) || n.querySelector(`${REVEAL},${PARALLAX}`))) found = true;
        });
      }
      if (found) scan(false);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const stop = () => {
      // Reduced motion switched on mid-visit: show everything and stop moving.
      if (!reduced.matches) return;
      root.classList.remove('fl-motion');
      parallax.forEach((el) => (el.style.transform = ''));
      parallax = [];
    };
    reduced.addEventListener('change', stop);
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);

    return () => {
      cleanups.forEach((c) => c());
      rescan.current = undefined;
      cancelAnimationFrame(arming);
      io.disconnect();
      mo.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      reduced.removeEventListener('change', stop);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      root.classList.remove('fl-motion', 'fl-arming', 'fl-live');
    };
  }, []);

  useEffect(() => {
    rescan.current?.();
  }, [path]);

  return null;
}
