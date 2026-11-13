import { Fragment } from 'react';
import { dbReady } from '@/lib/db/pool';
import { listApplications } from '@/lib/events/store';
import { setApplication } from '../../actions';
import type { JobApplication } from '@/lib/events/types';

const list = (v?: string[]) => (v && v.length ? v.join(', ') : null);
const yn = (v?: string) => (v === 'yes' ? 'Yes' : v === 'no' ? 'No' : null);

/** The fuller application's answers, under the applicant's row. Older applications only have the basics. */
function Details({ a }: { a: JobApplication }) {
  const d = a.details;
  const rows: [string, React.ReactNode][] = (
    [
      ['Job', d.role],
      ['Seasons', list(d.seasons)],
      ['Hours', d.hours],
      ['Can start', d.start],
      ['Days', list(d.days)],
      ['Shifts', list(d.shifts)],
      ['Holidays and weekends', yn(d.holidays)],
      ['18 or older', yn(d.over18)],
      ['21 or older', yn(d.over21)],
      ['Can work in the U.S.', yn(d.authorized)],
      ['Certifications', list(d.certs)],
      ['Lives in', d.town],
      ['Pay hoped for', d.pay],
      ['Heard about us', d.heard],
    ] as [string, React.ReactNode][]
  ).filter(([, v]) => v);
  if (!rows.length && !d.about && !a.resume) return null;
  return (
    <details style={{ marginTop: 8 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>The full application</summary>
      <div style={{ display: 'grid', gap: 10, padding: '12px 0', maxWidth: 640 }}>
        {a.resume && <p style={{ margin: 0 }}><a href={`/admin/resume/${a.resume.id}`}>Download resume ({a.resume.filename})</a></p>}
        {d.about && <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{d.about}</p>}
        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '4px 16px', margin: 0 }}>
          {rows.map(([k, v]) => (<Fragment key={k}><dt style={{ fontWeight: 600 }}>{k}</dt><dd style={{ margin: 0 }}>{v}</dd></Fragment>))}
        </dl>
        {d.jobs && d.jobs.length > 0 && (<div><strong>Last jobs</strong><ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{d.jobs.map((j, i) => <li key={i}>{[j.role, j.employer, j.when].filter(Boolean).join(' · ')}</li>)}</ul></div>)}
        {d.refs && d.refs.length > 0 && (<div><strong>References</strong><ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{d.refs.map((r, i) => <li key={i}>{[r.name, r.relation, r.contact].filter(Boolean).join(' · ')}</li>)}</ul></div>)}
      </div>
    </details>
  );
}

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
                  <td><div style={{ fontWeight: 700 }}>{a.name}{a.details?.maybeBot && <span className="tag" style={{ marginLeft: 8, background: '#fde2e2', color: '#a33' }} title={a.details.maybeBot}>maybe bot</span>}</div><Details a={a} /></td>
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
