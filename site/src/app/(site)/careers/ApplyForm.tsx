'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { DEPARTMENTS } from '@/lib/events/types';
import { apply, type ApplyState } from './actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--amber" disabled={pending}>
      {pending ? 'Sending…' : 'Apply'}
    </button>
  );
}

export function ApplyForm() {
  const [state, action] = useFormState<ApplyState, FormData>(apply, null);
  if (state?.ok) {
    return (
      <div className="planner" role="status">
        <h3>Thank you.</h3>
        <p className="planner__note" style={{ fontSize: 16 }}>{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="planner" aria-label="Apply to work at River Ranch">
      <h3>Apply</h3>
      <label className="field" htmlFor="ap-name">
        Your name
        <input id="ap-name" name="name" type="text" autoComplete="name" required maxLength={120} />
      </label>
      <div className="planner__grid">
        <label className="field" htmlFor="ap-email">
          Email
          <input id="ap-email" name="email" type="email" autoComplete="email" maxLength={160} />
        </label>
        <label className="field" htmlFor="ap-phone">
          Phone
          <input id="ap-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
      </div>
      <fieldset className="room-choice">
        <legend>Which department are you applying for?</legend>
        <div style={{ display: 'grid', gap: 8 }}>
          {DEPARTMENTS.map((d) => (
            <label key={d} className="dept-choice">
              <input type="radio" name="department" value={d} required />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />
      {state && !state.ok && <p className="planner__note" role="alert" style={{ color: '#9b2c1f' }}>{state.message}</p>}
      <Submit />
    </form>
  );
}
