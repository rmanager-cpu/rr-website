import { listSubmissions } from '@/lib/form-log';

export const dynamic = 'force-dynamic';

const FORM_NAMES: Record<string, string> = { careers: 'Careers application', 'request-to-play': 'Request to play' };
const HIDE = new Set(['website', 'attest']);

// Every send of every website form, exactly as typed (site/supabase/no_drops.sql): the ones that were saved,
// the ones sent back to fix something, and the ones that looked like a bot. Nothing is ever dropped.
export default async function Submissions() {
  const list = await listSubmissions();
  return (
    <>
      <h1>Every submission</h1>
      <p className="help">Every send of the Careers and Request to play forms, newest first, including ones that were sent back to fix something and ones that looked like a bot. Saved ones also appear under Applications or Band requests. The Wall’s stories arrive by email.</p>
      {list.length === 0 && <p className="help">Nothing logged yet.</p>}
      {list.map((s) => (
        <div key={s.id} className="adm-card">
          <div className="row-actions" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>{FORM_NAMES[s.form] ?? s.form}</h2>
            <span>
              {s.maybeBot && <span className="tag" style={{ marginRight: 6, background: '#fde2e2', color: '#a33' }} title={s.maybeBot}>maybe bot</span>}
              <span className="tag">{s.saved ? 'saved' : 'not saved: needed fixing'}</span>
            </span>
          </div>
          <p className="help">
            {new Date(s.createdAt).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short' })} · Shown: “{s.outcome}”
          </p>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '2px 12px', fontSize: 14 }}>
            {Object.entries(s.fields).filter(([k]) => !HIDE.has(k)).map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <dt style={{ color: '#666' }}>{k}</dt>
                <dd style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{Array.isArray(v) ? v.join(', ') : String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </>
  );
}
