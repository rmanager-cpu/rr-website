'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signIn, type FormState } from '../actions';

function Go() {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn btn--amber" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>;
}

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, run] = useFormState<FormState, FormData>(signIn, null);
  return (
    <form action={run} className="adm-card" style={{ maxWidth: 420 }}>
      <h1>Staff sign-in</h1>
      {!configured && <p className="note">Staff sign-in isn’t set up on this copy of the site yet.</p>}
      {state && !state.ok && <p className="err" role="alert">{state.message}</p>}
      <label className="f">Password<input type="password" name="password" autoComplete="current-password" required autoFocus /></label>
      <Go />
    </form>
  );
}
