import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Frame, Section, SubmissionAdapter } from './types';
import { area, bounds, centroid, readingOrder, toPixels, type Box } from './geometry';
import { useViewport } from './useViewport';
import { FramePanel } from './FramePanel';
import { WallTiles } from './Tiles';
import { frameLabel, isAsk } from './labels';
import './wall.css';

export interface HistoryWallProps {
  sections: Section[];
  /** Frame content by id. Frames on the wall without an entry default to the "ask" box. */
  frames: Record<string, Frame>;
  adapter: SubmissionAdapter;
  /** Prefix for image paths in the data (e.g. "/" or a CDN origin). */
  assetBase?: string;
  /** Section to open on (defaults to the first). */
  initialSectionId?: string;
}

interface PlacedHotspot {
  frame: string;
  px: [number, number][];
  box: Box;
  center: [number, number];
}

const LIFT_OUT_MS = 200;

export function HistoryWall({ sections, frames, adapter, assetBase = '/', initialSectionId }: HistoryWallProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(() => Math.max(0, sections.findIndex((s) => s.id === initialSectionId)));
  const section = sections[index];
  const { width: W, height: H, files } = section.image;

  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [discover, setDiscover] = useState(false);
  const [hint, setHint] = useState(false);
  const hintCount = useRef(0);
  const hintTimer = useRef<number>();
  const lastPointer = useRef<string>('mouse');
  // First visit cue: every frame glows briefly (so it's clear they're tappable) and one short line
  // says what to do. The line stays until the visitor first touches the wall, or 8 seconds.
  const touchScreen = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const [nudge, setNudge] = useState(true);
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setNudge(false), 8000);
    const u = window.setTimeout(() => setIntro(false), 3200);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(u);
    };
  }, []);

  const showHint = useCallback(() => {
    if (hintCount.current >= 3) return;
    setHint(true);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => {
      setHint(false);
      hintCount.current += 1;
    }, 1600);
  }, []);

  const vp = useViewport({ contentW: W, contentH: H, resetKey: section.id, reducedMotion, onPlainWheel: showHint });

  const url = useCallback((src: string) => assetBase.replace(/\/$/, '') + '/' + src.replace(/^\//, ''), [assetBase]);

  // Load sharper files only as the zoom level needs them, and keep the sharpest one we've loaded.
  const [level, setLevel] = useState(0);
  const [loadedLevel, setLoadedLevel] = useState(0);
  useEffect(() => {
    setLevel(0);
    setLoadedLevel(0);
    setActive(null);
  }, [section.id]);
  useEffect(() => {
    if (!vp.scale) return;
    const need = W * vp.scale * pixelRatio();
    let i = files.findIndex((f) => f.w >= need * 0.9);
    if (i < 0) i = files.length - 1;
    setLevel((l) => Math.max(l, i));
  }, [vp.scale, W, files]);

  // Warm the neighbouring sections once the current one has settled (keeps first load light on phones).
  useEffect(() => {
    const t = window.setTimeout(() => {
      for (const d of [-1, 1]) {
        const n = sections[(index + d + sections.length) % sections.length];
        if (n && n !== section) new Image().src = url(n.image.files[0].src);
      }
    }, 4000);
    return () => window.clearTimeout(t);
  }, [index, sections, section, url]);

  const placed = useMemo<PlacedHotspot[]>(
    () =>
      readingOrder(section.hotspots).map((h) => {
        const px = toPixels(h.points, W, H);
        return { frame: h.frame, px, box: bounds(px), center: centroid(px) };
      }),
    [section, W, H],
  );
  const byFrame = useMemo(() => new Map(placed.map((p) => [p.frame, p])), [placed]);

  // A frame on several sections opens from the photo where it's largest (sharpest, most straight-on).
  const bestShot = useMemo(() => {
    const best = new Map<string, { section: Section; px: [number, number][]; size: number }>();
    for (const s of sections)
      for (const h of s.hotspots) {
        const px = toPixels(h.points, s.image.width, s.image.height);
        const size = area(px);
        if (size > (best.get(h.frame)?.size ?? 0)) best.set(h.frame, { section: s, px, size });
      }
    return best;
  }, [sections]);

  const lifts = useLift(active);
  const liftSrc = url(files[loadedLevel].src);

  const frameFor = (id: string): Frame => frames[id] ?? { id };

  const openFrame = (id: string) => {
    setActive(id);
    setOpen(id);
  };

  // One tap or click opens a frame. (Hover still lifts it first on a mouse.)
  const onHotspotClick = (id: string) => {
    setNudge(false);
    openFrame(id);
  };

  // Teaser placement: above the frame unless that would fall off the top of the stage.
  const activeSpot = active ? byFrame.get(active) : undefined;
  const teaserBelow = activeSpot ? activeSpot.box.y * vp.getView().s + vp.getView().y < 84 : false;

  const go = (d: number) => setIndex((i) => (i + d + sections.length) % sections.length);

  // Keep the current section's tab in view in the scrolling strip (phones).
  const tabs = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const ol = tabs.current;
    const btn = ol?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!ol || !btn) return;
    const left = btn.offsetLeft - (ol.clientWidth - btn.offsetWidth) / 2;
    ol.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [index, reducedMotion]);

  const openShot = open ? bestShot.get(open) : undefined;
  const openOrder = placed.map((p) => p.frame);

  return (
    <div className={`hw${discover ? ' hw--discover' : ''}${intro && !discover && !reducedMotion ? ' hw--intro' : ''}`}>
      <div
        className="hw-stage"
        ref={vp.containerRef}
        tabIndex={0}
        role="region"
        aria-roledescription="photo wall"
        aria-label={`${section.title}. Drag to look around, pinch or use plus and minus to zoom, tab to move between photos.`}
        onPointerDownCapture={(e) => {
          lastPointer.current = e.pointerType;
          setNudge(false);
        }}
        onClick={(e) => {
          if (!(e.target as Element).closest('[data-hotspot]')) setActive(null);
        }}
        onKeyDown={(e) => e.key === 'Escape' && setActive(null)}
      >
        <div
          className="hw-layer"
          key={section.id}
          ref={vp.layerRef}
          style={{ width: W, height: H, backgroundImage: `url(${section.image.placeholder})` }}
        >
          <img className="hw-photo" src={url(files[0].src)} width={W} height={H} alt="" draggable={false} />
          {level > 0 && (
            <img
              className={`hw-photo hw-photo--sharp${loadedLevel >= level ? ' is-loaded' : ''}`}
              src={url(files[level].src)}
              width={W}
              height={H}
              alt=""
              draggable={false}
              onLoad={() => setLoadedLevel((l) => Math.max(l, level))}
            />
          )}
          <WallTiles image={section.image} subscribe={vp.subscribe} url={url} />

          <svg className="hw-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden={false}>
            <defs>
              <filter id={`hw-shadow-${section.id}`} x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="0" dy={W * 0.004} stdDeviation={W * 0.006} floodColor="#000" floodOpacity="0.55" />
              </filter>
              {lifts.map(({ id }) => {
                const p = byFrame.get(id);
                return p ? (
                  <clipPath id={`hw-clip-${section.id}-${id}`} key={id}>
                    <polygon points={p.px.map((q) => q.join(',')).join(' ')} />
                  </clipPath>
                ) : null;
              })}
            </defs>

            <rect className={`hw-dim${active ? ' is-on' : ''}`} width={W} height={H} />

            {lifts.map(({ id, leaving }) => {
              const p = byFrame.get(id);
              if (!p) return null;
              return (
                <g
                  key={id}
                  className={`hw-lift${leaving ? ' is-leaving' : ''}`}
                  style={{ transformOrigin: `${p.center[0]}px ${p.center[1]}px` }}
                  filter={`url(#hw-shadow-${section.id})`}
                >
                  <image href={liftSrc} width={W} height={H} clipPath={`url(#hw-clip-${section.id}-${id})`} />
                </g>
              );
            })}

            {placed.map((p) => {
              const f = frameFor(p.frame);
              return (
                <polygon
                  key={p.frame}
                  data-hotspot
                  className={`hw-hit${isAsk(f) ? '' : ' has-story'}${active === p.frame ? ' is-active' : ''}`}
                  points={p.px.map((q) => q.join(',')).join(' ')}
                  tabIndex={0}
                  role="button"
                  aria-label={frameLabel(f, section.title)}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(p.frame)}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && setActive((a) => (a === p.frame ? null : a))}
                  onFocus={(e) => {
                    // Keyboard focus only; a tap also focuses, and tap handling lives in onClick.
                    if (!e.currentTarget.matches(':focus-visible')) return;
                    setActive(p.frame);
                    vp.ensureVisible(p.box);
                  }}
                  onBlur={() => setActive((a) => (a === p.frame && !open ? null : a))}
                  onClick={() => onHotspotClick(p.frame)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openFrame(p.frame);
                    }
                  }}
                />
              );
            })}
          </svg>

          {activeSpot && (
            <div
              className={`hw-teaser${teaserBelow ? ' is-below' : ''}`}
              style={{
                left: activeSpot.box.x + activeSpot.box.w / 2,
                top: teaserBelow ? activeSpot.box.y + activeSpot.box.h : activeSpot.box.y,
              }}
              aria-hidden
            >
              <Teaser frame={frameFor(activeSpot.frame)} />
            </div>
          )}
        </div>

        <div className={`hw-hint${hint ? ' is-on' : ''}`} aria-hidden>
          {isMac() ? 'Pinch or ⌘ + scroll to zoom' : 'Pinch or Ctrl + scroll to zoom'}
        </div>
        <div className={`hw-hint hw-nudge${nudge && !hint ? ' is-on' : ''}`} aria-hidden>
          {touchScreen ? 'Tap any photo · swipe for more' : 'Click any photo to tell its story'}
          {touchScreen && <span className="hw-nudge-arrow">→</span>}
        </div>

        <div className="hw-controls" data-no-pan>
          <button type="button" className="hw-btn" onClick={() => vp.zoomBy(1 / 1.6)} aria-label="Zoom out">
            <Icon d="M5 12h14" />
          </button>
          <button type="button" className="hw-btn" onClick={() => vp.zoomBy(1.6)} aria-label="Zoom in">
            <Icon d="M12 5v14M5 12h14" />
          </button>
          <button type="button" className="hw-btn" onClick={() => vp.reset()} aria-label="Fit the wall">
            <Icon d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </button>
          <button
            type="button"
            className={`hw-btn${discover ? ' is-pressed' : ''}`}
            onClick={() => setDiscover((d) => !d)}
            aria-pressed={discover}
            aria-label="Outline every photo"
            title="Outline every photo"
          >
            <Icon d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M8 8h8v8H8z" />
          </button>
        </div>
      </div>

      {sections.length > 1 && (
      <nav className="hw-sections" aria-label="Sections of the wall">
        <button type="button" className="hw-btn hw-btn--ghost" onClick={() => go(-1)} aria-label="Previous section">
          <Icon d="M15 18l-6-6 6-6" />
        </button>
        <ol ref={tabs}>
          {sections.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={i === index ? 'is-current' : ''}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => setIndex(i)}
              >
                <span className="hw-sections-n">{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="hw-btn hw-btn--ghost" onClick={() => go(1)} aria-label="Next section">
          <Icon d="M9 18l6-6-6-6" />
        </button>
      </nav>
      )}

      {open && openShot && (
        <FramePanel
          key={open}
          frame={frameFor(open)}
          section={section}
          shot={openShot.section.image}
          points={openShot.px}
          url={url}
          previewSrc={openShot.section === section ? liftSrc : url(openShot.section.image.files[0].src)}
          closeupSrc={frameFor(open).closeup ? url(frameFor(open).closeup!) : undefined}
          adapter={adapter}
          position={{ index: openOrder.indexOf(open), total: openOrder.length }}
          onStep={(d) => {
            const next = openOrder[(openOrder.indexOf(open) + d + openOrder.length) % openOrder.length];
            setActive(next);
            setOpen(next);
            const p = byFrame.get(next);
            if (p) vp.ensureVisible(p.box);
          }}
          onClose={() => {
            setOpen(null);
            setActive(null);
          }}
        />
      )}
    </div>
  );
}

function Teaser({ frame }: { frame: Frame }) {
  const ask = isAsk(frame);
  return (
    <div className="hw-teaser-card">
      <span className="hw-teaser-title">
        {frame.title ?? (frame.tag ? `No. ${frame.tag}` : 'From the wall')}
      </span>
      <span className="hw-teaser-sub">{ask ? 'Know this one?' : (frame.teaser ?? 'Open')}</span>
    </div>
  );
}

/** Keeps a lifted frame rendered briefly after it's released, so it can settle back onto the wall. */
function useLift(active: string | null) {
  const [items, setItems] = useState<{ id: string; leaving: boolean }[]>([]);
  useEffect(() => {
    setItems((cur) => {
      const rest = cur.filter((i) => i.id !== active).map((i) => ({ ...i, leaving: true }));
      return active ? [...rest, { id: active, leaving: false }] : rest;
    });
    const t = window.setTimeout(() => setItems((cur) => cur.filter((i) => !i.leaving)), LIFT_OUT_MS);
    return () => window.clearTimeout(t);
  }, [active]);
  return items;
}

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setReduced(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** Screen density used for picking image sizes; capped at 2, past which phones gain little but pay a lot. */
function pixelRatio() {
  return Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1);
}

function isMac() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
