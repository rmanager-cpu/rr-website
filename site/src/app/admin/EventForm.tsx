'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { CATEGORIES, CATEGORY_LABEL, type EventPage, type EventSeries } from '@/lib/events/types';
import type { FormState } from './actions';
import { LinkRows, PhotoPicker } from './EventMedia';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Save({ label, busy }: { label: string; busy: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--amber" disabled={pending || busy}>
      {busy ? 'Uploading photos…' : pending ? 'Saving…' : label}
    </button>
  );
}

function YesNo({ name, question, help, value }: { name: string; question: string; help?: string; value?: boolean }) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <legend className="q">{question}</legend>
      {help && <p className="help">{help}</p>}
      <div className="choices">
        <label className="choice"><input type="radio" name={name} value="yes" defaultChecked={value === true} /> Yes</label>
        <label className="choice"><input type="radio" name={name} value="no" defaultChecked={value === false} /> No</label>
      </div>
    </fieldset>
  );
}

/**
 * Add or edit a calendar event, all on one screen: what, when, the details people see, the home page toggle,
 * and whether it closes anything. Only a yes to that last one asks the questions Venio needs, so
 * everyday events never meet them. Every event still gets its own page, made behind the scenes.
 */
export function EventForm({
  action,
  pages,
  spaces,
  initial,
  page,
  sharedWith = 0,
  mode,
  dbReady,
}: {
  action: (prev: FormState, f: FormData) => Promise<FormState>;
  pages: EventPage[];
  spaces: string[];
  initial?: EventSeries;
  page?: EventPage;
  sharedWith?: number;
  mode: 'new' | 'edit';
  dbReady: boolean;
}) {
  const [state, run] = useFormState(action, null);
  const [busy, setBusy] = useState(false);
  const s = initial;
  const weekly = s?.repeat === 'weekly';
  const closes = Boolean(s && (s.closedPrivate || s.closedRegular || s.venioSpaces.length));
  const photos = page?.photos.length ? page.photos : page?.heroImage ? [page.heroImage] : [];
  return (
    <form action={run} className="stack ev-form" style={{ gap: 18 }}>
      {!dbReady && <p className="note">The calendar database isn’t connected yet, so this can’t save. The paste for it is waiting in Supabase.</p>}
      {state && <p className={state.ok ? 'ok' : 'err'} role={state.ok ? 'status' : 'alert'}>{state.message}</p>}
      {page && <input type="hidden" name="page_slug_current" value={page.slug} />}

      <section className="adm-card">
        <h2 className="adm-step"><b>1</b> What</h2>
        <label className="f">Event name<input type="text" name="title" required maxLength={140} defaultValue={s?.title} placeholder="Prime Rib Night" /></label>
        <div className="adm-grid">
          <label className="f">Kind of event
            <select name="category" required defaultValue={s?.category ?? ''}>
              <option value="" disabled>Choose…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
          </label>
          <label className="f">Show on the site?
            <select name="status" defaultValue={s?.status ?? 'published'}>
              <option value="published">Yes, published</option>
              <option value="draft">Not yet (draft)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>
      </section>

      <section className="adm-card">
        <h2 className="adm-step"><b>2</b> When and where</h2>
        <div className="choices">
          <label className="choice"><input type="radio" name="repeat" value="none" defaultChecked={!weekly} /> One date</label>
          <label className="choice"><input type="radio" name="repeat" value="weekly" defaultChecked={weekly} /> Repeats every week</label>
        </div>
        <div className="adm-grid">
          <label className="f">Date (or first date)<input type="date" name="starts_on" required defaultValue={s?.startsOn} /></label>
          <label className="f weekly-only">Last date (optional)<input type="date" name="ends_on" defaultValue={s?.endsOn ?? ''} /></label>
          <label className="f">Starts (optional)<input type="time" name="start_time" defaultValue={s?.startTime ?? ''} /></label>
          <label className="f">Ends (optional)<input type="time" name="end_time" defaultValue={s?.endTime ?? ''} /></label>
        </div>
        <fieldset className="weekly-only" style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <legend className="q">Which days?</legend>
          <div className="choices">
            {DAYS.map((d, i) => (
              <label key={d} className="choice"><input type="checkbox" name="weekdays" value={i + 1} defaultChecked={s?.weekdays.includes(i + 1)} /> {d}</label>
            ))}
          </div>
          <label className="choice" style={{ alignSelf: 'flex-start' }}><input type="checkbox" name="skip_holidays" value="yes" defaultChecked={s?.skipHolidays ?? true} /> Skip major holidays</label>
          <label className="f">Other dates to skip (optional)<input type="text" name="skip_dates" defaultValue={s?.skipDates.join(', ') ?? ''} placeholder="2026-12-24, 2027-01-01" /></label>
        </fieldset>
        <div className="choices">
          <label className="choice"><input type="radio" name="offsite" value="no" defaultChecked={!s?.offsite} /> At River Ranch</label>
          <label className="choice"><input type="radio" name="offsite" value="yes" defaultChecked={s?.offsite} /> Off-site</label>
        </div>
        <label className="f offsite-only">Where (off-site)<input type="text" name="location" maxLength={200} defaultValue={s?.location ?? ''} placeholder="North Tahoe Event Center, Kings Beach" /></label>
      </section>

      <section className="adm-card">
        <h2 className="adm-step"><b>3</b> Details, photos and links</h2>
        {sharedWith > 0 && <p className="note">This event shares its page with {sharedWith} other event{sharedWith > 1 ? 's' : ''}, so changes to the details, photos and links show on all of them.</p>}
        <div className="page-new stack" style={{ gap: 14 }}>
          <label className="f">Details (optional)<textarea name="page_body" maxLength={20000} rows={6} defaultValue={page?.body ?? ''} /><span className="help">What people should know. Leave a blank line between paragraphs.</span></label>
          <PhotoPicker initial={photos} onBusy={setBusy} />
          <LinkRows initial={page?.links ?? []} />
        </div>
        <label className="f">Tickets link (optional)<input type="text" inputMode="url" name="ticket_url" maxLength={400} defaultValue={s?.ticketUrl ?? ''} placeholder="https://…" /></label>
        <label className="f">Short note on the calendar (optional)<input type="text" name="note" maxLength={300} defaultValue={s?.note ?? ''} placeholder="Doors at 6." /></label>
      </section>

      <section className="adm-card">
        <h2 className="adm-step"><b>4</b> Home page</h2>
        <label className="choice" style={{ alignSelf: 'flex-start' }}><input type="checkbox" name="highlighted" value="yes" defaultChecked={s?.highlighted} /> Show this on the home page</label>
        <p className="help">The home page shows the next three events with this on, soonest first, each with its photo and a link here. A weekly event shows on its next date. Needs a photo. With none on, the next few dated events show instead.</p>
      </section>

      <section className="adm-card">
        <h2 className="adm-step"><b>5</b> Does this close anything?</h2>
        <p className="help">Most events don’t. Choose yes only if it closes River Ranch or takes over a space.</p>
        <div className="choices">
          <label className="choice"><input type="radio" name="closes" value="no" defaultChecked={!closes} /> No</label>
          <label className="choice"><input type="radio" name="closes" value="yes" defaultChecked={closes} /> Yes</label>
        </div>
        <div className="closes-only stack" style={{ gap: 14 }}>
          <YesNo name="closed_private" question="Is River Ranch closed for private events?" help="Yes blocks private bookings on these dates in Venio." value={closes ? s?.closedPrivate : undefined} />
          <YesNo name="closed_regular" question="Is River Ranch closed for regular service?" help="Yes means the restaurant isn’t open to the public as usual." value={closes ? s?.closedRegular : undefined} />
          <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <legend className="q">Which space?</legend>
            <div className="choices">
              <label className="choice"><input type="checkbox" name="venio_spaces" value="__none" defaultChecked={closes && !s?.venioSpaces.length} /> No specific space</label>
              {spaces.map((sp) => (
                <label key={sp} className="choice"><input type="checkbox" name="venio_spaces" value={sp} defaultChecked={s?.venioSpaces.includes(sp)} /> {sp}</label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {mode === 'new' && (
        <details className="adm-card">
          <summary className="help">Part of a series that already has a page?</summary>
          <div className="choices" style={{ marginTop: 12 }}>
            <label className="choice"><input type="radio" name="page_choice" value="new" defaultChecked /> No, give it its own page</label>
            <label className="choice"><input type="radio" name="page_choice" value="existing" /> Yes, share a page</label>
          </div>
          <label className="f page-existing" style={{ marginTop: 12 }}>Which page?
            <select name="page_existing" defaultValue="">
              <option value="">Choose…</option>
              {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </label>
        </details>
      )}

      <div className="row-actions">
        <Save label={mode === 'new' ? 'Add to Calendar' : 'Save'} busy={busy} />
      </div>
    </form>
  );
}

/** Two taps, so nobody deletes an event by accident. */
export function DeleteEvent({ action }: { action: () => Promise<void> }) {
  const [sure, setSure] = useState(false);
  if (!sure) return <button type="button" className="ph-btn" onClick={() => setSure(true)}>Delete this event</button>;
  return (
    <form action={action} className="row-actions">
      <span className="help">This removes it from the calendar for good. To keep a record, set it to Cancelled instead.</span>
      <button type="submit" className="ph-btn ph-btn--danger">Yes, delete it</button>
      <button type="button" className="ph-btn" onClick={() => setSure(false)}>Keep it</button>
    </form>
  );
}
