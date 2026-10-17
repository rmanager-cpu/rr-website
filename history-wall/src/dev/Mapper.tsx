import { useEffect, useMemo, useRef, useState } from 'react';
import { loadSections } from '../data';
import { useViewport } from '../wall/useViewport';
import { centroid } from '../wall/geometry';
import type { Hotspot, Point } from '../wall/types';
import './mapper.css';

/**
 * Dev-only tool for tracing frames on a section photo (open /#mapper while `npm run dev` runs).
 *   Add: click each corner of a frame in order (top-left, top-right, bottom-right, bottom-left);
 *        Enter or clicking the first point finishes, Esc cancels. Ovals: click more points around.
 *   Select: click an outline, drag its corners, rename it, or delete it.
 *   Save writes src/data/geometry/<section>.json.
 */
export function Mapper() {
  const sections = useMemo(() => loadSections(), []);
  const [sectionId, setSectionId] = useState(sections[0].id);
  const section = sections.find((s) => s.id === sectionId)!;
  const { width: W, height: H, files } = section.image;

  const [spots, setSpots] = useState<Hotspot[]>(section.hotspots);
  const [selected, setSelected] = useState<number | null>(null);
  const [mode, setMode] = useState<'select' | 'add'>('select');
  const [draft, setDraft] = useState<Point[]>([]);
  const [naming, setNaming] = useState<Point[] | null>(null);
  const [newId, setNewId] = useState('f');
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('');
  const dragIdx = useRef<number | null>(null);

  useEffect(() => {
    setSpots(section.hotspots);
    setSelected(null);
    setDraft([]);
    setNaming(null);
    setDirty(false);
  }, [section]);

  const vp = useViewport({ contentW: W, contentH: H, resetKey: sectionId, reducedMotion: false, maxZoom: 3 });
  const r = 7 / (vp.scale || 1);

  const update = (next: Hotspot[]) => {
    setSpots(next);
    setDirty(true);
  };

  const norm = (clientX: number, clientY: number): Point => {
    const [x, y] = vp.toWorld(clientX, clientY);
    return [+(x / W).toFixed(4), +(y / H).toFixed(4)];
  };

  const finishDraft = () => {
    if (draft.length >= 3) {
      setNaming(draft);
      setDraft([]);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as Element).closest('input')) return;
      if (e.key === 'Enter' && mode === 'add') finishDraft();
      if (e.key === 'Escape') {
        setDraft([]);
        setSelected(null);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected !== null) {
        update(spots.filter((_, i) => i !== selected));
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onStageClick = (e: React.MouseEvent) => {
    if (mode !== 'add' || naming) return;
    const p = norm(e.clientX, e.clientY);
    if (draft.length >= 3) {
      const [fx, fy] = draft[0];
      const close = Math.hypot((p[0] - fx) * W, (p[1] - fy) * H) < r * 2;
      if (close) return finishDraft();
    }
    setDraft([...draft, p]);
  };

  const save = async () => {
    setStatus('Saving…');
    const res = await fetch('/__mapper/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: sectionId, hotspots: spots }),
    });
    setStatus(res.ok ? `Saved ${spots.length} outlines` : `Save failed: ${await res.text()}`);
    if (res.ok) setDirty(false);
  };

  const pts = (p: Point[]) => p.map(([x, y]) => `${x * W},${y * H}`).join(' ');

  return (
    <div className="mp">
      <aside className="mp-side">
        <h1>Frame mapper</h1>
        <label>
          Section
          <select
            value={sectionId}
            onChange={(e) => {
              if (dirty && !confirm('Discard unsaved changes?')) return;
              setSectionId(e.target.value);
            }}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.id})
              </option>
            ))}
          </select>
        </label>

        <div className="mp-modes">
          <button className={mode === 'select' ? 'on' : ''} onClick={() => { setMode('select'); setDraft([]); }}>Select</button>
          <button className={mode === 'add' ? 'on' : ''} onClick={() => { setMode('add'); setSelected(null); }}>Add frame</button>
        </div>

        {mode === 'add' && !naming && (
          <p className="mp-help">
            Click the corners in order: top-left, top-right, bottom-right, bottom-left. Press Enter or click the first point to finish. Esc cancels.
            {draft.length > 0 && <strong> {draft.length} point{draft.length > 1 ? 's' : ''}.</strong>}
          </p>
        )}

        {naming && (
          <form
            className="mp-name"
            onSubmit={(e) => {
              e.preventDefault();
              const id = newId.trim();
              if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) return setStatus('Ids: lowercase letters, numbers, dashes (e.g. f41 or u-ski-boat)');
              update([...spots, { frame: id, points: naming }]);
              setNaming(null);
              setSelected(spots.length);
              setNewId('f');
              setStatus('');
            }}
          >
            <label>
              Frame id: <code>f</code> + the number on its tag, or <code>u-</code> + a name
              <input autoFocus value={newId} onChange={(e) => setNewId(e.target.value)} />
            </label>
            <div className="mp-row">
              <button type="submit">Add</button>
              <button type="button" onClick={() => setNaming(null)}>Cancel</button>
            </div>
          </form>
        )}

        <ol className="mp-list">
          {spots.map((s, i) => (
            <li key={i} className={i === selected ? 'on' : ''} onClick={() => { setMode('select'); setSelected(i); }}>
              <input
                value={s.frame}
                onChange={(e) => update(spots.map((x, j) => (j === i ? { ...x, frame: e.target.value } : x)))}
              />
              <span>{s.points.length} pts</span>
              <button aria-label={`Delete ${s.frame}`} onClick={(e) => { e.stopPropagation(); update(spots.filter((_, j) => j !== i)); setSelected(null); }}>×</button>
            </li>
          ))}
        </ol>

        <div className="mp-row">
          <button className="mp-save" onClick={save} disabled={!dirty}>Save{dirty ? ' *' : ''}</button>
          <button onClick={() => navigator.clipboard.writeText(JSON.stringify({ section: sectionId, hotspots: spots }, null, 1))}>Copy JSON</button>
        </div>
        <p className="mp-status">{status}</p>
        <p className="mp-help">Drag to pan, ctrl/⌘ + scroll or pinch to zoom. Delete removes the selected outline.</p>
      </aside>

      <div className={`mp-stage${mode === 'add' ? ' is-adding' : ''}`} ref={vp.containerRef} onClick={onStageClick}>
        <div className="mp-layer" ref={vp.layerRef} style={{ width: W, height: H }}>
          <img src={'/' + files[files.length - 1].src} width={W} height={H} alt="" draggable={false} />
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
            {spots.map((s, i) => {
              const [cx, cy] = centroid(s.points);
              return (
                <g key={i}>
                  <polygon
                    points={pts(s.points)}
                    className={`mp-poly${i === selected ? ' on' : ''}`}
                    style={{ strokeWidth: 2 / (vp.scale || 1) }}
                    onClick={(e) => {
                      if (mode !== 'select') return;
                      e.stopPropagation();
                      setSelected(i);
                    }}
                  />
                  <text x={cx * W} y={cy * H} fontSize={16 / (vp.scale || 1)} className="mp-label">{s.frame}</text>
                </g>
              );
            })}
            {selected !== null && spots[selected] &&
              spots[selected].points.map(([x, y], k) => (
                <circle
                  key={k}
                  data-no-pan
                  cx={x * W}
                  cy={y * H}
                  r={r}
                  className="mp-handle"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    (e.target as Element).setPointerCapture(e.pointerId);
                    dragIdx.current = k;
                  }}
                  onPointerMove={(e) => {
                    if (dragIdx.current !== k) return;
                    const p = norm(e.clientX, e.clientY);
                    update(spots.map((s, j) => (j === selected ? { ...s, points: s.points.map((q, m) => (m === k ? p : q)) } : s)));
                  }}
                  onPointerUp={() => (dragIdx.current = null)}
                  onClick={(e) => e.stopPropagation()}
                />
              ))}
            {draft.length > 0 && (
              <>
                <polyline points={pts(draft)} className="mp-draft" style={{ strokeWidth: 2 / (vp.scale || 1) }} />
                {draft.map(([x, y], k) => (
                  <circle key={k} cx={x * W} cy={y * H} r={r} className="mp-handle" />
                ))}
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
