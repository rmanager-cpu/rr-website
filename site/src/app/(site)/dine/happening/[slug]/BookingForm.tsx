'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { requestToPlay, type BookState } from './booking-actions';

function Send() {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn btn--amber" disabled={pending}>{pending ? 'Sending…' : 'Send request'}</button>;
}

export function BookingForm() {
  const [state, run] = useFormState<BookState, FormData>(requestToPlay, null);
  if (state?.ok) return <div className="planner" role="status"><h3>Thank you.</h3><p className="planner__note" style={{ fontSize: 16 }}>{state.message}</p></div>;
  return (
    <form action={run} className="planner" aria-label="Request to play the Summer Concert Series">
      <h3>Request to play</h3>
      <div className="planner__grid">
        <label className="field" htmlFor="bk-act">Band or act<input id="bk-act" name="act_name" required maxLength={140} /></label>
        <label className="field" htmlFor="bk-contact">Contact name<input id="bk-contact" name="contact" autoComplete="name" required maxLength={120} /></label>
        <label className="field" htmlFor="bk-email">Email<input id="bk-email" name="email" type="email" autoComplete="email" maxLength={160} /></label>
        <label className="field" htmlFor="bk-phone">Phone<input id="bk-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
        <label className="field" htmlFor="bk-genre">Genre<input id="bk-genre" name="genre" maxLength={140} placeholder="Funk, jam, bluegrass…" /></label>
        <label className="field" htmlFor="bk-home">Based in<input id="bk-home" name="hometown" maxLength={140} placeholder="Truckee, CA" /></label>
      </div>
      <label className="field" htmlFor="bk-links">Where can we hear you?<input id="bk-links" name="links" maxLength={1000} placeholder="Instagram, Spotify, YouTube, website" /></label>
      <label className="field" htmlFor="bk-dates">Dates you’re open (optional)<input id="bk-dates" name="dates" maxLength={400} placeholder="Mondays in July, Labor Day weekend…" /></label>
      <label className="field" htmlFor="bk-msg">Anything else (optional)<textarea id="bk-msg" name="message" maxLength={4000} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />
      {state && !state.ok && <p className="planner__note" role="alert" style={{ color: '#9b2c1f' }}>{state.message}</p>}
      <Send />
    </form>
  );
}
