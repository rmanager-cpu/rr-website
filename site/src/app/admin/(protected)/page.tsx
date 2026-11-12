import Link from 'next/link';
import { dbReady } from '@/lib/db/pool';
import { formatDate, nextDate, todayInTahoe, whenPhrase } from '@/lib/events/recurrence';
import { listApplications, listPages, listSeries } from '@/lib/events/store';
import { CATEGORY_LABEL } from '@/lib/events/types';

export default async function Dashboard({ searchParams }: { searchParams: { saved?: string; deleted?: string } }) {
  const ready = await dbReady();
  const [series, pages, apps] = await Promise.all([listSeries(), listPages(), listApplications()]);
  const pageOf = new Map(pages.map((p) => [p.id, p]));
  const today = todayInTahoe();
  const rows = series
    .map((s) => ({ s, next: nextDate(s, series, today) }))
    .sort((a, b) => (a.next ?? '9999').localeCompare(b.next ?? '9999'));
  const newApps = apps.filter((a) => a.status === 'new').length;
  return (
    <>
      <div className="row-actions" style={{ justifyContent: 'space-between' }}>
        <h1>What’s On calendar</h1>
        <Link href="/admin/events/new" className="btn btn--amber">Add to Calendar</Link>
      </div>
      {searchParams.saved && <p className="ok" role="status">Added to the calendar.</p>}
      {searchParams.deleted && <p className="ok" role="status">Deleted.</p>}
      {!ready && <p className="note">Showing the built-in starting events. Editing switches on once the calendar database is connected.</p>}
      {newApps > 0 && <p className="note"><Link href="/admin/applications">{newApps} new job application{newApps > 1 ? 's' : ''}</Link></p>}
      <div className="adm-card tbl">
        <table>
          <thead><tr><th>Event</th><th>When</th><th>Next</th><th>Venio</th><th>Page</th></tr></thead>
          <tbody>
            {rows.map(({ s, next }) => {
              const p = pageOf.get(s.pageId);
              return (
                <tr key={s.id}>
                  <td>
                    <Link href={`/admin/events/${s.id}`} style={{ fontWeight: 700 }}>{s.title}</Link>
                    <div className="help">{CATEGORY_LABEL[s.category]}{s.status !== 'published' ? ` · ${s.status}` : ''}{s.offsite ? ' · off-site' : ''}</div>
                    {s.highlighted && <span className="tag">On the home page</span>}
                  </td>
                  <td>{whenPhrase(s)}</td>
                  <td>{next ? formatDate(next) : <span className="help">done</span>}</td>
                  <td>
                    {s.closedPrivate && <span className="tag tag--warn">No private events</span>} {s.closedRegular && <span className="tag tag--warn">Closed to public</span>}
                    {s.venioSpaces.length > 0 && <div className="help">{s.venioSpaces.join(', ')}</div>}
                  </td>
                  <td>{p ? <><Link href={`/admin/pages/${p.id}`}>Edit page</Link> · <a href={`/dine/happening/${p.slug}`} target="_blank">View</a></> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
