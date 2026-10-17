import { useCallback, useEffect, useRef, useState } from 'react';
import type { Box } from './geometry';

/** screen = world * s + (x, y), in px relative to the container. World units are source-image pixels. */
export interface View {
  s: number;
  x: number;
  y: number;
}

interface Options {
  contentW: number;
  contentH: number;
  /** Changing this resets the view (e.g. when switching sections). */
  resetKey: string;
  reducedMotion: boolean;
  /** Most screen px per source px. */
  maxZoom?: number;
  /** Called when someone scrolls the page over the wall without a zoom modifier. */
  onPlainWheel?: () => void;
}

/**
 * Pan/zoom for one large image plus anything layered on it. The transform is written straight to the
 * layer element (no React render per frame); React only hears about coarse scale changes, which drive
 * which resolution to load.
 *
 * Gestures: drag (with momentum), pinch, ctrl/cmd + wheel and trackpad pinch to zoom, horizontal wheel
 * to pan, double-click / double-tap to zoom, arrows / + / - / 0 on the keyboard. A plain vertical wheel
 * is left to the page so the wall never traps scrolling. On touch, vertical swipes scroll the page
 * unless the wall is zoomed in past its height.
 */
export function useViewport({ contentW, contentH, resetKey, reducedMotion, maxZoom = 2, onPlainWheel }: Options) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const view = useRef<View>({ s: 1, x: 0, y: 0 });
  const size = useRef({ w: 0, h: 0 });
  const pristine = useRef(true);
  const dragged = useRef(false);
  const anim = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);
  const reported = useRef(0);
  const [scale, setScale] = useState(0);
  const listeners = useRef(new Set<(v: View, size: { w: number; h: number }) => void>());

  const opts = useRef({ contentW, contentH, reducedMotion, maxZoom, onPlainWheel });
  opts.current = { contentW, contentH, reducedMotion, maxZoom, onPlainWheel };

  const limits = useCallback(() => {
    const { w, h } = size.current;
    const { contentW: cw, contentH: ch, maxZoom: mz } = opts.current;
    const contain = Math.min(w / cw, h / ch);
    // Fill the height (a long wall then scrolls sideways), but never start more than ~6 screens wide.
    const initial = Math.max(contain, Math.min(h / ch, (w * 6) / cw));
    return { min: contain, max: Math.max(mz, contain * 1.01), initial };
  }, []);

  const clamp = useCallback(
    (v: View): View => {
      const { w, h } = size.current;
      const { contentW: cw, contentH: ch } = opts.current;
      const { min, max } = limits();
      const s = Math.min(max, Math.max(min, v.s));
      const sw = cw * s;
      const sh = ch * s;
      const x = sw <= w ? (w - sw) / 2 : Math.min(0, Math.max(w - sw, v.x));
      const y = sh <= h ? (h - sh) / 2 : Math.min(0, Math.max(h - sh, v.y));
      return { s, x, y };
    },
    [limits],
  );

  const apply = useCallback((v: View) => {
    view.current = v;
    const layer = layerRef.current;
    const el = containerRef.current;
    if (layer) {
      layer.style.transform = `translate3d(${v.x}px, ${v.y}px, 0) scale(${v.s})`;
      // Promote only while moving; dropping it afterwards lets the browser re-rasterize sharply.
      layer.style.willChange = 'transform';
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        if (layerRef.current) layerRef.current.style.willChange = 'auto';
      }, 180);
    }
    if (el) {
      el.style.setProperty('--s', String(v.s));
      el.style.touchAction = opts.current.contentH * v.s <= size.current.h + 1 ? 'pan-y' : 'none';
    }
    if (!reported.current || Math.abs(v.s - reported.current) / v.s > 0.08) {
      reported.current = v.s;
      setScale(v.s);
    }
    listeners.current.forEach((fn) => fn(v, size.current));
  }, []);

  /** Called on every view change (pan or zoom); keep handlers cheap. Returns an unsubscribe. */
  const subscribe = useCallback((fn: (v: View, size: { w: number; h: number }) => void) => {
    listeners.current.add(fn);
    if (size.current.w) fn(view.current, size.current);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  const initialView = useCallback((): View => {
    const { h } = size.current;
    const s = limits().initial;
    // Start at the left end of a wall wider than the screen; centre anything that fits.
    return clamp({ s, x: 0, y: (h - opts.current.contentH * s) / 2 });
  }, [clamp, limits]);

  const stopAnim = useCallback(() => {
    if (anim.current) cancelAnimationFrame(anim.current);
    anim.current = null;
  }, []);

  const animateTo = useCallback(
    (target: View, ms = 340) => {
      stopAnim();
      const to = clamp(target);
      if (opts.current.reducedMotion || ms <= 0) return apply(to);
      const from = { ...view.current };
      const { w, h } = size.current;
      const cFrom = [(w / 2 - from.x) / from.s, (h / 2 - from.y) / from.s];
      const cTo = [(w / 2 - to.x) / to.s, (h / 2 - to.y) / to.s];
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / ms);
        const e = 1 - Math.pow(1 - k, 3);
        if (k >= 1) {
          anim.current = null;
          return apply(to);
        }
        const s = Math.exp(Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * e);
        const cx = cFrom[0] + (cTo[0] - cFrom[0]) * e;
        const cy = cFrom[1] + (cTo[1] - cFrom[1]) * e;
        apply({ s, x: w / 2 - cx * s, y: h / 2 - cy * s });
        anim.current = requestAnimationFrame(step);
      };
      anim.current = requestAnimationFrame(step);
    },
    [apply, clamp, stopAnim],
  );

  const zoomAt = useCallback(
    (factor: number, px: number, py: number, animate = false) => {
      const v = view.current;
      const s = clamp({ ...v, s: v.s * factor }).s;
      const wx = (px - v.x) / v.s;
      const wy = (py - v.y) / v.s;
      const next = { s, x: px - wx * s, y: py - wy * s };
      pristine.current = false;
      if (animate) animateTo(next);
      else apply(clamp(next));
    },
    [animateTo, apply, clamp],
  );

  const zoomBy = useCallback(
    (factor: number) => zoomAt(factor, size.current.w / 2, size.current.h / 2, true),
    [zoomAt],
  );

  const reset = useCallback(
    (immediate = false) => {
      pristine.current = true;
      const v = initialView();
      if (immediate) {
        stopAnim();
        apply(v);
      } else animateTo(v);
    },
    [animateTo, apply, initialView, stopAnim],
  );

  /** Pan (and zoom out if needed) so a world-space box is comfortably on screen. */
  const ensureVisible = useCallback(
    (box: Box, margin = 48) => {
      const v = view.current;
      const { w, h } = size.current;
      const fit = Math.min((w - margin * 2) / box.w, (h - margin * 2) / box.h);
      const s = Math.min(v.s, fit);
      const left = box.x * s + v.x;
      const top = box.y * s + v.y;
      const inside =
        s === v.s && left >= margin && top >= margin && left + box.w * s <= w - margin && top + box.h * s <= h - margin;
      if (inside) return;
      pristine.current = false;
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      animateTo({ s, x: w / 2 - cx * s, y: h / 2 - cy * s });
    },
    [animateTo],
  );

  const toWorld = useCallback((clientX: number, clientY: number): [number, number] => {
    const r = containerRef.current!.getBoundingClientRect();
    const v = view.current;
    return [(clientX - r.left - v.x) / v.s, (clientY - r.top - v.y) / v.s];
  }, []);

  // Reset when the content changes.
  useEffect(() => {
    if (size.current.w) reset(true);
  }, [resetKey, contentW, contentH, reset]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      size.current = { w: width, h: height };
      apply(pristine.current ? initialView() : clamp(view.current));
    });
    ro.observe(el);

    const pointers = new Map<number, { x: number; y: number }>();
    let drag: { px: number; py: number; x: number; y: number } | null = null;
    let pinch: { d0: number; s0: number; mx: number; my: number; x0: number; y0: number } | null = null;
    let samples: { t: number; x: number; y: number }[] = [];
    let moved = false;
    let wasPinch = false;
    let inertia: number | null = null;
    let lastTap = { t: 0, x: 0, y: 0 };

    const local = (e: { clientX: number; clientY: number }) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const stopInertia = () => {
      if (inertia) cancelAnimationFrame(inertia);
      inertia = null;
    };
    const rebase = () => {
      const pts = [...pointers.values()];
      const v = view.current;
      samples = [];
      if (pts.length === 1) {
        pinch = null;
        drag = { px: pts[0].x, py: pts[0].y, x: v.x, y: v.y };
      } else if (pts.length >= 2) {
        const [a, b] = pts;
        drag = null;
        wasPinch = true;
        pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, s0: v.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, x0: v.x, y0: v.y };
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if ((e.target as Element).closest('[data-no-pan]')) return;
      stopAnim();
      stopInertia();
      if (pointers.size === 0) {
        moved = false;
        wasPinch = false;
        dragged.current = false;
      }
      pointers.set(e.pointerId, local(e));
      rebase();
    };

    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, local(e));
      const pts = [...pointers.values()];
      if (pinch && pts.length >= 2) {
        const [a, b] = pts;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const s = clamp({ ...view.current, s: (pinch.s0 * d) / pinch.d0 }).s;
        const wx = (pinch.mx - pinch.x0) / pinch.s0;
        const wy = (pinch.my - pinch.y0) / pinch.s0;
        moved = true;
        dragged.current = true;
        pristine.current = false;
        apply(clamp({ s, x: mx - wx * s, y: my - wy * s }));
        return;
      }
      if (!drag) return;
      const p = pts[0];
      const dx = p.x - drag.px;
      const dy = p.y - drag.py;
      if (!moved && Math.hypot(dx, dy) < (e.pointerType === 'mouse' ? 4 : 8)) return;
      if (!moved) {
        moved = true;
        dragged.current = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
      }
      pristine.current = false;
      apply(clamp({ s: view.current.s, x: drag.x + dx, y: drag.y + dy }));
      samples.push({ t: e.timeStamp, x: p.x, y: p.y });
      if (samples.length > 6) samples.shift();
    };

    const onUp = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      const p = local(e);
      pointers.delete(e.pointerId);
      if (pointers.size > 0) return rebase();
      el.classList.remove('is-dragging');

      if (moved && !wasPinch && e.type === 'pointerup' && !opts.current.reducedMotion && samples.length >= 2) {
        const last = samples[samples.length - 1];
        const first = samples.find((s) => last.t - s.t < 100) ?? samples[0];
        const dt = Math.max(1, last.t - first.t);
        let vx = (last.x - first.x) / dt;
        let vy = (last.y - first.y) / dt;
        const sp = Math.hypot(vx, vy);
        if (sp > 3) {
          vx = (vx / sp) * 3;
          vy = (vy / sp) * 3;
        }
        if (sp > 0.15 && e.timeStamp - last.t < 80) {
          let prev = performance.now();
          const step = (t: number) => {
            const dtt = t - prev;
            prev = t;
            const v = view.current;
            apply(clamp({ s: v.s, x: v.x + vx * dtt, y: v.y + vy * dtt }));
            const decay = Math.pow(0.94, dtt / 16);
            vx *= decay;
            vy *= decay;
            inertia = Math.hypot(vx, vy) > 0.02 ? requestAnimationFrame(step) : null;
          };
          inertia = requestAnimationFrame(step);
        }
      }

      // Double-tap to zoom (touch), away from hotspots.
      if (!moved && e.pointerType === 'touch' && e.type === 'pointerup') {
        const onHotspot = (e.target as Element).closest?.('[data-hotspot]');
        if (!onHotspot && e.timeStamp - lastTap.t < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30) {
          toggleZoom(p.x, p.y);
          lastTap = { t: 0, x: 0, y: 0 };
        } else lastTap = { t: e.timeStamp, x: p.x, y: p.y };
      }
      drag = null;
      pinch = null;
    };

    const toggleZoom = (px: number, py: number) => {
      const { max } = limits();
      if (view.current.s >= max * 0.9) reset();
      else zoomAt(2.4, px, py, true);
    };

    // Swallow the click that ends a drag so it doesn't open a frame.
    const onClickCapture = (e: MouseEvent) => {
      if (dragged.current) {
        e.stopPropagation();
        e.preventDefault();
        dragged.current = false;
      }
    };

    const onDblClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('[data-hotspot], [data-no-pan]')) return;
      const p = local(e);
      toggleZoom(p.x, p.y);
    };

    const onWheel = (e: WheelEvent) => {
      const scaleDelta = e.deltaMode === 1 ? 16 : 1;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        stopAnim();
        stopInertia();
        const dy = Math.max(-60, Math.min(60, e.deltaY * scaleDelta));
        const p = local(e);
        zoomAt(Math.exp(-dy * 0.01), p.x, p.y);
        return;
      }
      const v = view.current;
      const overflowX = opts.current.contentW * v.s > size.current.w + 1;
      if (overflowX && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        pristine.current = false;
        apply(clamp({ ...v, x: v.x - e.deltaX * scaleDelta }));
        return;
      }
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) opts.current.onPlainWheel?.();
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as Element;
      if (t !== el && !t.closest('[data-hotspot]')) return;
      const v = view.current;
      const step = 80;
      const pan = (dx: number, dy: number) => {
        pristine.current = false;
        animateTo({ ...v, x: v.x + dx, y: v.y + dy }, 160);
      };
      switch (e.key) {
        case 'ArrowLeft': pan(step, 0); break;
        case 'ArrowRight': pan(-step, 0); break;
        case 'ArrowUp': pan(0, step); break;
        case 'ArrowDown': pan(0, -step); break;
        case '+': case '=': zoomBy(1.5); break;
        case '-': case '_': zoomBy(1 / 1.5); break;
        case '0': reset(); break;
        default: return;
      }
      e.preventDefault();
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('click', onClickCapture, true);
    el.addEventListener('dblclick', onDblClick);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('keydown', onKey);
    return () => {
      ro.disconnect();
      stopInertia();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('click', onClickCapture, true);
      el.removeEventListener('dblclick', onDblClick);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('keydown', onKey);
    };
  }, [animateTo, apply, clamp, initialView, limits, reset, stopAnim, zoomAt, zoomBy]);

  return {
    containerRef,
    layerRef,
    scale,
    zoomBy,
    reset,
    ensureVisible,
    toWorld,
    subscribe,
    getView: () => view.current,
  };
}
