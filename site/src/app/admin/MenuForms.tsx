'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import type { FormState } from './actions';
import { shrink } from './EventMedia';

/** A tap-to-open row: the summary is the tidy line, the editor opens underneath. Rows sharing a group open
    one at a time; when one closes above the row you tapped, the page jumps, so the tapped row is scrolled
    back into view. */
export function Fold({ summary, children, className, group = 'mi-open' }: { summary: React.ReactNode; children: React.ReactNode; className?: string; group?: string }) {
  return (
    <details
      className={`mi-fold${className ? ` ${className}` : ''}`}
      name={group}
      onToggle={(e) => {
        const d = e.currentTarget;
        if (d.open) d.querySelector(':scope > summary')?.scrollIntoView({ block: 'nearest' });
      }}
    >
      <summary>{summary}</summary>
      <div className="mi-panel">{children}</div>
    </details>
  );
}

const TAGS = ['GF', 'GM', 'DF', 'V', 'VG', 'CG'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Btn({ label, small }: { label: string; small?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`btn ${small ? 'btn--sm btn--navy' : 'btn--amber'}`} disabled={pending} style={small ? { minHeight: 38 } : undefined}>
      {pending ? 'Saving…' : label}
    </button>
  );
}

const Msg = ({ s }: { s: FormState }) => (s ? <span className={s.ok ? 'tag' : 'err'} role={s.ok ? 'status' : 'alert'} style={s.ok ? undefined : { padding: '4px 10px' }}>{s.message}</span> : null);

export type ItemInit = {
  name: string; description: string; tags: string[]; raw: boolean; prices: string; priceNote: string; hidden: boolean; sort: number; elsewhere: string; mismatch: boolean;
  slug: string; page: boolean; story: string; photo: string; pageLive: boolean;
};

/** One photo for a dish's own page, uploaded the same way as event photos (shrunk first, location data stripped). */
function DishPhoto({ initial }: { initial: string }) {
  const [photo, setPhoto] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const body = await shrink(file).catch(() => { throw new Error('That file couldn’t be read as a photo. Try a JPG or PNG.'); });
      const res = await fetch('/admin/photo', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? 'That photo didn’t save. Please try again.');
      setPhoto(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That photo didn’t save. Please try again.');
    }
    setBusy(false);
  }
  return (
    <div className="mi-photo">
      <input type="hidden" name="photo" value={photo} />
      {photo && <Image src={photo} alt="" width={132} height={99} className="mi-photo__img" />}
      <div className="row-actions">
        <label className="ph-btn mi-photo__pick">
          {busy ? 'Uploading…' : photo ? 'Change photo' : 'Add a photo'}
          <input type="file" accept="image/*" disabled={busy} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        {photo && !busy && <button type="button" className="ph-btn" onClick={() => setPhoto('')}>Remove photo</button>}
      </div>
      {error && <p className="err" role="alert" style={{ margin: 0 }}>{error}</p>}
    </div>
  );
}

/** One dish on one menu. Name, description, tags and the dish's own page are the dish's (shared by every
    menu); prices are this menu's. Banquet menus pass noPrices and never show the page fields. */
export function ItemRow({ action, init, noPrices }: { action: (p: FormState, f: FormData) => Promise<FormState>; init: ItemInit; noPrices?: boolean }) {
  const [state, run] = useFormState(action, null);
  return (
    <form action={run} className="mi-row">
      <div className="mi-grid">
        <label className="f">Dish<input type="text" name="name" defaultValue={init.name} required maxLength={160} /></label>
        {!noPrices && <label className="f">Price<input type="text" name="prices" defaultValue={init.prices} placeholder="18 or Half 12 / Full 17" maxLength={120} /></label>}
        {!noPrices && <label className="f">Or note<input type="text" name="price_note" defaultValue={init.priceNote} placeholder="Market Price" maxLength={60} /></label>}
        <label className="f mi-order">Order<input type="text" name="sort" defaultValue={String(init.sort)} inputMode="numeric" maxLength={4} /></label>
      </div>
      <label className="f">Description<textarea name="description" defaultValue={init.description} rows={2} maxLength={2000} /></label>
      {!noPrices && (
        <fieldset className="mi-page">
          <input type="hidden" name="page_fields" value="yes" />
          <label className="mi-page__toggle"><input type="checkbox" name="page" value="yes" defaultChecked={init.page} /> Give this dish its own page</label>
          <div className="mi-page__more">
            <p className="help">For signature dishes people search for by name. The page goes live once the story has words in it, and the dish’s name links to it on every menu it’s on.</p>
            <label className="f">Page story<textarea name="story" defaultValue={init.story} rows={5} maxLength={4000} placeholder="A few lines only this page has: where it comes from, how it’s made, why people order it." /></label>
            <DishPhoto initial={init.photo} />
            {init.pageLive && <a href={`/dine/menus/dishes/${init.slug}`} target="_blank" rel="noopener">See the page →</a>}
          </div>
        </fieldset>
      )}
      <div className="row-actions" style={{ justifyContent: 'space-between' }}>
        <div className="choices">
          {TAGS.map((t) => <label key={t} className="choice" style={{ minHeight: 36, padding: '0 10px' }}><input type="checkbox" name="tags" value={t} defaultChecked={init.tags.includes(t)} /> {t}</label>)}
          <label className="choice" style={{ minHeight: 36, padding: '0 10px' }}><input type="checkbox" name="raw" value="yes" defaultChecked={init.raw} /> Raw ^</label>
          <label className="choice" style={{ minHeight: 36, padding: '0 10px' }}><input type="checkbox" name="hidden" value="yes" defaultChecked={init.hidden} /> Hide</label>
        </div>
        <div className="row-actions"><Msg s={state} /><Btn label="Save" small /></div>
      </div>
      {init.elsewhere && <p className={init.mismatch ? 'note' : 'help'} style={{ margin: 0 }}>{init.mismatch ? 'Price differs on another menu: ' : 'Also on: '}{init.elsewhere}</p>}
    </form>
  );
}

export function AddItem({ action, noPrices }: { action: (p: FormState, f: FormData) => Promise<FormState>; noPrices?: boolean }) {
  const [state, run] = useFormState(action, null);
  const form = useRef<HTMLFormElement>(null);
  // Clear the boxes once a dish is added, so the next one starts fresh.
  useEffect(() => { if (state?.ok) form.current?.reset(); }, [state]);
  return (
    <form ref={form} action={run} className="mi-row mi-add">
      <div className="mi-grid">
        <label className="f">New dish<input type="text" name="name" required maxLength={160} /></label>
        {!noPrices && <label className="f">Price<input type="text" name="prices" placeholder="18 or Half 12 / Full 17" maxLength={120} /></label>}
        <label className="f" style={{ gridColumn: 'span 2' }}>Description<input type="text" name="description" maxLength={2000} /></label>
      </div>
      <div className="row-actions"><Msg s={state} /><Btn label="Add dish" small /></div>
    </form>
  );
}

export function SectionHead({ action, name, note, sort }: { action: (p: FormState, f: FormData) => Promise<FormState>; name: string; note: string; sort: number }) {
  const [state, run] = useFormState(action, null);
  return (
    <form action={run} className="mi-grid" style={{ alignItems: 'end' }}>
      <label className="f">Section<input type="text" name="name" defaultValue={name} required maxLength={120} /></label>
      <label className="f" style={{ gridColumn: 'span 2' }}>Note under the heading (add-ons, hours)<input type="text" name="note" defaultValue={note} maxLength={600} /></label>
      <label className="f mi-order">Order<input type="text" name="sort" defaultValue={String(sort)} maxLength={4} /></label>
      <div className="row-actions"><Msg s={state} /><Btn label="Save section" small /></div>
    </form>
  );
}

export type MenuInit = { name: string; intro: string; servingNote: string; footer: string; active: boolean; showUntil: string; theme: string; size: string; kind: 'regular' | 'holiday' | 'banquet'; hours: { days: number[]; start: string; end: string; label: string }[] };

const THEMES = [['classic', 'Classic'], ['fireside', 'Fireside'], ['trailhead', 'Trailhead'], ['band', 'Band']];
const PAPERS = [['letter', 'Letter (8.5 × 11)'], ['legal', 'Legal (8.5 × 14)'], ['half-letter', 'Half sheet (5.5 × 8.5)']];

/** Heading and subheading for a new holiday or banquet menu, copied from that kind's template. */
export function NewEventMenu({ action, label }: { action: (p: FormState, f: FormData) => Promise<FormState>; label: string }) {
  const [state, run] = useFormState(action, null);
  return (
    <form action={run} className="adm-grid" style={{ alignItems: 'end' }}>
      <label className="f">Heading<input type="text" name="name" required maxLength={80} /></label>
      <label className="f">Subheading<input type="text" name="intro" maxLength={1000} /></label>
      <div className="row-actions"><Msg s={state} /><Btn label={label} small /></div>
    </form>
  );
}

export function MenuSettings({ action, init }: { action: (p: FormState, f: FormData) => Promise<FormState>; init: MenuInit }) {
  const [state, run] = useFormState(action, null);
  const rows = [0, 1, 2].map((n) => init.hours[n] ?? { days: [], start: '', end: '', label: '' });
  const event = init.kind !== 'regular';
  const banquet = init.kind === 'banquet';
  return (
    <form action={run} className="mi-settings">
      {state &&<p className={state.ok ? 'ok' : 'err'}>{state.message}</p>}
      <div className="adm-grid">
        <label className="f">{event ? 'Heading' : 'Menu name'}<input type="text" name="name" defaultValue={init.name} required maxLength={80} /></label>
        <label className="f">Print style<select name="theme" defaultValue={init.theme}>{THEMES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label className="f">Paper<select name="size" defaultValue={init.size}>{PAPERS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        {banquet ? (
          <input type="hidden" name="active" value="no" />
        ) : (
          <>
            <label className="f">Serving note (when there are no set hours)<input type="text" name="serving_note" defaultValue={init.servingNote} maxLength={200} placeholder="Summer, on the riverside patio" /></label>
            <label className="f">Show until (optional, it hides itself after this date)<input type="date" name="show_until" defaultValue={init.showUntil} /></label>
            <label className="f">On the site?<select name="active" defaultValue={init.active ? 'yes' : 'no'}><option value="yes">Yes</option><option value="no">Hidden</option></select></label>
          </>
        )}
      </div>
      <label className="f">{event ? 'Subheading' : 'Intro line (optional)'}<input type="text" name="intro" defaultValue={init.intro} maxLength={1000} /></label>
      {banquet && <p className="help" style={{ margin: 0 }}>Banquet menus are for printing and sending. They never appear on the website and never show prices.</p>}
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: event ? 'none' : 'flex', flexDirection: 'column', gap: 10 }}>
        <legend className="q">Serving hours (used for the page, “serving now” and Google)</legend>
        {rows.map((h, n) => (
          <div key={n} className="adm-card" style={{ padding: 12, gap: 8 }}>
            <div className="choices">{DAYS.map((d, i) => <label key={d} className="choice" style={{ minHeight: 34, padding: '0 10px' }}><input type="checkbox" name={`h${n}_days`} value={i + 1} defaultChecked={h.days.includes(i + 1)} /> {d}</label>)}</div>
            <div className="adm-grid">
              <label className="f">From<input type="time" name={`h${n}_start`} defaultValue={h.start} /></label>
              <label className="f">Until<input type="time" name={`h${n}_end`} defaultValue={h.end} /></label>
              <label className="f">Label<input type="text" name={`h${n}_label`} defaultValue={h.label} placeholder="Nightly" maxLength={60} /></label>
            </div>
          </div>
        ))}
      </fieldset>
      <label className="f">Fine print at the bottom<textarea name="footer" defaultValue={init.footer} rows={3} maxLength={2000} /></label>
      <Btn label="Save menu settings" />
    </form>
  );
}
