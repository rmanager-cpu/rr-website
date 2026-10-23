'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Paper size, columns, which sections to include, and Print. Also shrinks the menu to fit one page. */
export function PrintControls({ sizes, size, cols, sections, backHref }: { sizes: { value: string; label: string }[]; size: string; cols: number; sections: { id: string; name: string; on: boolean }[]; backHref: string }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [scale, setScale] = useState(1);

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params.toString());
    if (v) p.set(k, v); else p.delete(k);
    router.replace(`${path}?${p.toString()}`);
  };

  // Shrink-to-fit: lower the type size until the menu fits on one page (never below 70%).
  useEffect(() => {
    const fit = document.getElementById('pm-fit');
    const page = fit?.parentElement;
    if (!fit || !page) return;
    let s = 1;
    fit.style.setProperty('--pm-scale', '1');
    for (let n = 0; n < 40 && fit.scrollHeight > page.clientHeight && s > 0.7; n++) {
      s -= 0.01;
      fit.style.setProperty('--pm-scale', String(s));
    }
    setScale(s);
  });

  const hide = (id: string, on: boolean) => {
    const cur = new Set((params.get('hide') ?? '').split(',').filter(Boolean));
    if (on) cur.delete(id); else cur.add(id);
    set('hide', [...cur].join(','));
  };

  return (
    <div className="pm-controls">
      <Link href={backHref}>← Back to the editor</Link>
      <label>Paper
        <select value={size} onChange={(e) => set('size', e.target.value)}>
          {sizes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>
      <label>Columns
        <select value={cols} onChange={(e) => set('cols', e.target.value)}>
          {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <details>
        <summary>Sections</summary>
        {sections.map((s) => (
          <label key={s.id} style={{ display: 'flex', gap: 6 }}><input type="checkbox" checked={s.on} onChange={(e) => hide(s.id, e.target.checked)} /> {s.name}</label>
        ))}
      </details>
      <span className={scale < 0.85 ? 'pm-warn' : ''}>{scale < 1 ? `Shrunk to ${Math.round(scale * 100)}% to fit` : 'Fits at full size'}{scale <= 0.7 ? ' (still too long: try bigger paper or more columns)' : ''}</span>
      <button type="button" onClick={() => window.print()}>Print or save as PDF</button>
    </div>
  );
}
