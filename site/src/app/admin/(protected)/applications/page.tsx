import { dbReady } from '@/lib/db/pool';
import { listApplications } from '@/lib/events/store';
import { setApplication } from '../../actions';

const NEXT: Record<string, { to: 'contacted' | 'hired' | 'closed' | 'new'; label: string }[]> = {
  new: [{ to: 'contacted', label: 'Mark contacted' }, { to: 'closed', label: 'Close' }],
  contacted: [{ to: 'hired', label: 'Hired' }, { to: 'closed', label: 'Close' }],
  hired: [{ to: 'new', label: 'Reopen' }],
  closed: [{ to: 'new', label: 'Reopen' }],
};

export default async function Applications() {
  const ready = await dbReady();
  const apps = await listApplications();
  return (
    <>
      <h1>Job applications</h1>
      {!ready && <p className="note">Applications start arriving here once the database is connected.</p>}
      {ready && apps.length === 0 && <p className="help">No applications yet.</p>}
      {apps.length > 0 && (
        <div className="adm-card tbl">
          <table>
            <thead><tr><th>When</th><th>Name</th><th>Department</th><th>Reach them</th><th>Status</th></tr></thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.createdAt).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric' })}</td>
                  <td style={{ fontWeight: 700 }}>{a.name}</td>
                  <td>{a.department}</td>
                  <td>{a.email && <div><a href={`mailto:${a.email}`}>{a.email}</a></div>}{a.phone && <div><a href={`tel:${a.phone}`}>{a.phone}</a></div>}</td>
                  <td>
                    <span className="tag">{a.status}</span>
                    <div className="row-actions" style={{ marginTop: 6 }}>
                      {NEXT[a.status].map((n) => (
                        <form key={n.to} action={setApplication.bind(null, a.id, n.to)}><button type="submit" className="btn btn--sm btn--navy" style={{ minHeight: 34, padding: '0 12px', fontSize: 11 }}>{n.label}</button></form>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
