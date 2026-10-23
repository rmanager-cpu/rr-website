import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/session';
import { signOut } from '../actions';

export default function Protected({ children }: { children: React.ReactNode }) {
  requireAdmin();
  return (
    <>
      <header className="adm-top">
        <span className="adm-brand">River Ranch · Staff</span>
        <nav aria-label="Staff">
          <Link href="/admin">Calendar</Link>
          <Link href="/admin/events/new">Add event</Link>
          <Link href="/admin/applications">Applications</Link>
          <Link href="/" target="_blank">View site</Link>
          <form action={signOut}><button type="submit" className="btn btn--sm" style={{ background: 'transparent', color: 'var(--ice)', border: '1px solid rgba(245,247,249,.4)', minHeight: 36 }}>Sign out</button></form>
        </nav>
      </header>
      <main className="adm-main">{children}</main>
    </>
  );
}
