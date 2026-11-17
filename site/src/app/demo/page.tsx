import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { configured, enabled, hasDemoAccess } from '@/lib/demo/access';
import './demo.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Booking preview',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function DemoPage({ searchParams }: { searchParams: { error?: string } }) {
  if (!enabled()) notFound();
  if (hasDemoAccess()) redirect('/stay/rooms#group-booking');
  return <main id="main" className="demo-login">
    <form method="post" action="/api/demo/session" className="demo-login__card">
      <span className="brand__logo" aria-label="River Ranch" role="img" />
      <h1>Booking preview.</h1>
      {configured() ? <>
        <label htmlFor="demo-password">Password</label>
        <input id="demo-password" name="password" type="password" required autoComplete="current-password" maxLength={256} />
        {searchParams.error && <p role="alert">Incorrect password.</p>}
        <button className="btn">Enter</button>
      </> : <p>Preview unavailable.</p>}
    </form>
  </main>;
}
