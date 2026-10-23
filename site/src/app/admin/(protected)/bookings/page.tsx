import { dbReady } from '@/lib/db/pool';
import { listBookingRequests } from '@/lib/events/store';
import { setBooking } from '../../actions';

const NEXT: Record<string, { to: 'new' | 'reviewing' | 'booked' | 'passed'; label: string }[]> = {
  new: [{ to: 'reviewing', label: 'Reviewing' }, { to: 'passed', label: 'Pass' }],
  reviewing: [{ to: 'booked', label: 'Booked' }, { to: 'passed', label: 'Pass' }],
  booked: [{ to: 'reviewing', label: 'Back to reviewing' }],
  passed: [{ to: 'new', label: 'Reopen' }],
};

export default async function Bookings() {
  const ready = await dbReady();
  const list = await listBookingRequests();
  return (
    <>
      <h1>Band booking requests</h1>
      <p className="help">From “Request to play” on the Summer Concert Series page.</p>
      {!ready && <p className="note">Requests start arriving here once the database is connected.</p>}
      {ready && list.length === 0 && <p className="help">No requests yet.</p>}
      {list.map((b) => (
        <div key={b.id} className="adm-card">
          <div className="row-actions" style={{ justifyContent: 'space-between' }}>
            <h2>{b.actName}</h2>
            <span className="tag">{b.status}</span>
          </div>
          <p className="help">
            {new Date(b.createdAt).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric' })} · {b.contact}
            {b.email && <> · <a href={`mailto:${b.email}`}>{b.email}</a></>}
            {b.phone && <> · <a href={`tel:${b.phone}`}>{b.phone}</a></>}
          </p>
          {(b.genre || b.hometown) && <p style={{ margin: 0 }}>{[b.genre, b.hometown].filter(Boolean).join(' · ')}</p>}
          {b.links && <p style={{ margin: 0, wordBreak: 'break-word' }}><strong>Listen:</strong> {b.links}</p>}
          {b.dates && <p style={{ margin: 0 }}><strong>Open:</strong> {b.dates}</p>}
          {b.message && <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{b.message}</p>}
          <div className="row-actions">
            {NEXT[b.status].map((n) => (
              <form key={n.to} action={setBooking.bind(null, b.id, n.to)}><button type="submit" className="btn btn--sm btn--navy">{n.label}</button></form>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
