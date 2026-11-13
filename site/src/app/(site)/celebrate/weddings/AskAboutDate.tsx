'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { askAboutDate, type AskState } from './ask-actions';

function Send() {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn" disabled={pending}>{pending ? 'Sending…' : 'Ask about my date'}</button>;
}

/** The wedding inquiry: a date and a guest count in, the packet out (the events team emails it). */
export function AskAboutDate() {
  const [state, run] = useFormState<AskState, FormData>(askAboutDate, null);
  if (state?.ok) return <div className="planner cel-ask" role="status"><h3>Thank you.</h3><p className="planner__note" style={{ fontSize: 16 }}>{state.message}</p></div>;
  return (
    <form action={run} className="planner cel-ask" aria-label="Ask about your wedding date">
      <h3>Ask about your date</h3>
      <p className="planner__note">Tell us your date and we’ll check the calendar, then email you the wedding packet: spaces, menus and pricing.</p>
      <div className="planner__grid">
        <label className="field" htmlFor="wd-name">Your name<input id="wd-name" name="name" autoComplete="name" required maxLength={120} /></label>
        <label className="field" htmlFor="wd-email">Email<input id="wd-email" name="email" type="email" autoComplete="email" maxLength={160} /></label>
        <label className="field" htmlFor="wd-phone">Phone (optional)<input id="wd-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
        <label className="field" htmlFor="wd-guests">About how many guests?<input id="wd-guests" name="guests" inputMode="numeric" maxLength={40} placeholder="e.g. 80" /></label>
      </div>
      <label className="field" htmlFor="wd-date">Date you have in mind<input id="wd-date" name="date" maxLength={200} placeholder="Saturday, September 18, 2027, or “a Saturday next September”" /></label>
      <label className="field" htmlFor="wd-msg">Anything else (optional)<textarea id="wd-msg" name="message" maxLength={3000} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />
      {state && !state.ok && <p className="planner__note" role="alert" style={{ color: '#9b2c1f' }}>{state.message}</p>}
      <Send />
    </form>
  );
}
