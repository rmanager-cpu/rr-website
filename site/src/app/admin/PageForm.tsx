'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { LAYOUTS, type EventPage } from '@/lib/events/types';
import type { FormState } from './actions';

function Save() {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn btn--amber" disabled={pending}>{pending ? 'Saving…' : 'Save page'}</button>;
}

export function PageForm({ action, page, dbReady }: { action: (p: FormState, f: FormData) => Promise<FormState>; page: EventPage; dbReady: boolean }) {
  const [state, run] = useFormState(action, null);
  return (
    <form action={run} className="adm-card">
      {!dbReady && <p className="note">The calendar database isn’t connected yet, so this can’t save.</p>}
      {state && <p className={state.ok ? 'ok' : 'err'} role={state.ok ? 'status' : 'alert'}>{state.message}</p>}
      <label className="f">Page title<input type="text" name="page_title" required maxLength={140} defaultValue={page.title} /></label>
      <label className="f">Web address<input type="text" name="page_slug" maxLength={80} defaultValue={page.slug} /><span className="help">riverranchlodge.com/events/{page.slug}. Changing it breaks old links, so only change it if you must.</span></label>
      <label className="f">One-line summary (Google shows this)<input type="text" name="page_summary" maxLength={400} defaultValue={page.summary ?? ''} /></label>
      <label className="f">Details<textarea name="page_body" maxLength={20000} rows={10} defaultValue={page.body ?? ''} /><span className="help">Leave a blank line between paragraphs. A page with no summary or details stays hidden from Google until it has some.</span></label>
      <div className="adm-grid">
        <label className="f">Look<select name="page_layout" defaultValue={page.layout}>{LAYOUTS.map((l) => <option key={l} value={l}>{l}</option>)}</select></label>
        <label className="f">Photo path<input type="text" name="page_hero" maxLength={400} defaultValue={page.heroImage ?? ''} /></label>
      </div>
      <Save />
    </form>
  );
}
