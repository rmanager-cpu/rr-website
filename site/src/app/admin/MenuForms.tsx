'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { FormState } from './actions';

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

export type ItemInit = { name: string; description: string; tags: string[]; raw: boolean; prices: string; priceNote: string; hidden: boolean; sort: number; elsewhere: string; mismatch: boolean };

/** One dish on one menu. Name, description and tags are the dish's (shared by every menu); prices are this menu's. */
export function ItemRow({ action, init }: { action: (p: FormState, f: FormData) => Promise<FormState>; init: ItemInit }) {
  const [state, run] = useFormState(action, null);
  return (
    <form action={run} className="mi-row" style={init.hidden ? { opacity: 0.55 } : undefined}>
      <div className="mi-grid">
        <label className="f">Dish<input type="text" name="name" defaultValue={init.name} required maxLength={160} /></label>
        <label className="f">Price<input type="text" name="prices" defaultValue={init.prices} placeholder="18 or Half 12 / Full 17" maxLength={120} /></label>
        <label className="f">Or note<input type="text" name="price_note" defaultValue={init.priceNote} placeholder="Market Price" maxLength={60} /></label>
        <label className="f mi-order">Order<input type="text" name="sort" defaultValue={String(init.sort)} inputMode="numeric" maxLength={4} /></label>
      </div>
      <label className="f">Description<textarea name="description" defaultValue={init.description} rows={2} maxLength={2000} /></label>
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

export function AddItem({ action }: { action: (p: FormState, f: FormData) => Promise<FormState> }) {
  const [state, run] = useFormState(action, null);
  return (
    <form action={run} className="mi-row mi-add">
      <div className="mi-grid">
        <label className="f">New dish<input type="text" name="name" required maxLength={160} /></label>
        <label className="f">Price<input type="text" name="prices" placeholder="18 or Half 12 / Full 17" maxLength={120} /></label>
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

export type MenuInit = { name: string; intro: string; servingNote: string; footer: string; active: boolean; showUntil: string; hours: { days: number[]; start: string; end: string; label: string }[] };

export function MenuSettings({ action, init }: { action: (p: FormState, f: FormData) => Promise<FormState>; init: MenuInit }) {
  const [state, run] = useFormState(action, null);
  const rows = [0, 1, 2].map((n) => init.hours[n] ?? { days: [], start: '', end: '', label: '' });
  return (
    <form action={run} className="adm-card">
      <h2>Menu settings</h2>
      {state && <p className={state.ok ? 'ok' : 'err'}>{state.message}</p>}
      <div className="adm-grid">
        <label className="f">Menu name<input type="text" name="name" defaultValue={init.name} required maxLength={80} /></label>
        <label className="f">Serving note (when there are no set hours)<input type="text" name="serving_note" defaultValue={init.servingNote} maxLength={200} placeholder="Summer, on the riverside patio" /></label>
        <label className="f">Show until (optional, for seasonal menus)<input type="date" name="show_until" defaultValue={init.showUntil} /></label>
        <label className="f">On the site?<select name="active" defaultValue={init.active ? 'yes' : 'no'}><option value="yes">Yes</option><option value="no">Hidden</option></select></label>
      </div>
      <label className="f">Intro line (optional)<input type="text" name="intro" defaultValue={init.intro} maxLength={1000} /></label>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
