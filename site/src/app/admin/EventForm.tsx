'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { CATEGORIES, CATEGORY_LABEL, LAYOUTS, type EventPage, type EventSeries } from '@/lib/events/types';
import type { FormState } from './actions';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LAYOUT_LABEL: Record<(typeof LAYOUTS)[number], string> = { standard: 'Standard', apres: 'Après (happy hour look)', collage: 'Collage (concert series look)' };

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--amber" disabled={pending}>
      {pending ? 'Saving…' : label}
    </button>
  );
}

function YesNo({ name, question, help, value }: { name: string; question: string; help?: string; value?: boolean }) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <legend className="q">{question}</legend>
      {help && <p className="help">{help}</p>}
      <div className="choices">
        <label className="choice"><input type="radio" name={name} value="yes" required defaultChecked={value === true} /> Yes</label>
        <label className="choice"><input type="radio" name={name} value="no" required defaultChecked={value === false} /> No</label>
      </div>
    </fieldset>
  );
}

/**
 * Add or edit an event. Adding walks through four steps, all on one screen: what, when, the Venio
 * questions (asked every time: closed for private events? for regular service? which space?), and the
 * event's page (required: a new page, or share one with the rest of a series).
 */
export function EventForm({
  action,
  pages,
  spaces,
  initial,
  mode,
  dbReady,
}: {
  action: (prev: FormState, f: FormData) => Promise<FormState>;
  pages: EventPage[];
  spaces: string[];
  initial?: EventSeries;
  mode: 'new' | 'edit';
  dbReady: boolean;
}) {
  const [state, run] = useFormState(action, null);
  const s = initial;
  const weekly = s?.repeat === 'weekly';
  return (
    <form action={run} className="stack ev-form" style={{ gap: 18 }}>
      {!dbReady && <p className="note">The calendar database isn’t connected yet, so this can’t save. The paste for it is waiting in Supabase.</p>}
      {state && <p className={state.ok ? 'ok' : 'err'} role={state.ok ? 'status' : 'alert'}>{state.message}</p>}

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
        <label className="f">Short note on the calendar (optional)<input type="text" name="note" maxLength={300} defaultValue={s?.note ?? ''} placeholder="More details to come." /></label>
      </section>

      <section className="adm-card">
        <h2 className="adm-step"><b>2</b> When</h2>
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
        <div className="adm-grid">
          <label className="f offsite-only">Where (off-site)<input type="text" name="location" maxLength={200} defaultValue={s?.location ?? ''} placeholder="North Tahoe Event Center, Kings Beach" /></label>
          <label className="f">Tickets link (optional)<input type="url" name="ticket_url" maxLength={400} defaultValue={s?.ticketUrl ?? ''} placeholder="https://…" /></label>
        </div>
      </section>

      <section className="adm-card">
        <h2 className="adm-step"><b>3</b> For Venio (the events app)</h2>
        <YesNo name="closed_private" question="Is River Ranch closed for private events?" help="Yes blocks private bookings on these dates in Venio." value={s?.closedPrivate} />
        <YesNo name="closed_regular" question="Is River Ranch closed for regular service?" help="Yes means the restaurant isn’t open to the public as usual." value={s?.closedRegular} />
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <legend className="q">Which space?</legend>
          <div className="choices">
            <label className="choice"><input type="checkbox" name="venio_spaces" value="__none" defaultChecked={mode === 'edit' && !s?.venioSpaces.length} /> No specific space</label>
            {spaces.map((sp) => (
              <label key={sp} className="choice"><input type="checkbox" name="venio_spaces" value={sp} defaultChecked={s?.venioSpaces.includes(sp)} /> {sp}</label>
            ))}
          </div>
        </fieldset>
      </section>

      {mode === 'new' ? (
        <section className="adm-card">
          <h2 className="adm-step"><b>4</b> The event’s page</h2>
          <p className="help">Every event gets a page on the site. A repeating event, or one that’s part of a series, can share one.</p>
          <div className="choices">
            <label className="choice"><input type="radio" name="page_choice" value="new" required defaultChecked /> Make a new page</label>
            <label className="choice"><input type="radio" name="page_choice" value="existing" required /> Share an existing page</label>
          </div>
          <div className="page-new stack" style={{ gap: 14 }}>
            <label className="f">Page title (defaults to the event name)<input type="text" name="page_title" maxLength={140} /></label>
            <label className="f">One-line summary (shows in Google)<input type="text" name="page_summary" maxLength={400} placeholder="Prime rib every Thursday night by the fire." /></label>
            <label className="f">Details (optional, blank is fine for now)<textarea name="page_body" maxLength={20000} /></label>
            <div className="adm-grid">
              <label className="f">Look
                <select name="page_layout" defaultValue="standard">{LAYOUTS.map((l) => <option key={l} value={l}>{LAYOUT_LABEL[l]}</option>)}</select>
              </label>
              <label className="f">Photo (optional, e.g. /photos/fireplace-room-fire.jpg)<input type="text" name="page_hero" maxLength={400} /></label>
            </div>
          </div>
          <label className="f page-existing">Which page?
            <select name="page_existing" defaultValue="">
              <option value="">Choose…</option>
              {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </label>
        </section>
      ) : null}

      <div className="row-actions">
        <Save label={mode === 'new' ? 'Add event and page' : 'Save event'} />
      </div>
    </form>
  );
}
