import 'server-only';
import { db } from '@/lib/db/pool';

// Nothing anyone sends on the website is ever dropped (management's rule, 2026-11-12). Every send of every
// form lands here, exactly as typed, whatever happened to it: saved, sent back to fix something, or looking
// like a bot. /admin/submissions lists it. Table: site/supabase/no_drops.sql.

export type FormName = 'careers' | 'request-to-play' | 'wedding-date';

/** Everything the person typed, as text. A file is noted by name, type and size (the file itself is kept
 *  with the application when it's saved). */
export function formFields(f: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of f.entries()) {
    if (k.startsWith('$ACTION')) continue; // Next's own bookkeeping
    const val = typeof v === 'string' ? v.slice(0, 4000) : v.size ? `[file: ${v.name || 'unnamed'}, ${v.type || 'unknown type'}, ${Math.round(v.size / 1024)} KB]` : '';
    if (!val) continue;
    const prev = out[k];
    out[k] = prev === undefined ? val : Array.isArray(prev) ? [...prev, val] : [prev, val];
  }
  return out;
}

/** Records one send. Never throws: if the log can't be written, the whole send goes to the server log.
 *  Returns whether it reached the database. */
export async function logSubmission(e: { form: FormName; outcome: string; saved: boolean; maybeBot?: string | null; fields: Record<string, unknown> }): Promise<boolean> {
  try {
    await db().query('insert into site_form_log (form, outcome, saved, maybe_bot, fields) values ($1,$2,$3,$4,$5::jsonb)', [
      e.form, e.outcome.slice(0, 500), e.saved, e.maybeBot ?? null, JSON.stringify(e.fields),
    ]);
    return true;
  } catch (err) {
    console.error('form-log: could not record a submission, keeping it here instead', err instanceof Error ? err.message : err, JSON.stringify(e));
    return false;
  }
}

export type LoggedSubmission = { id: string; createdAt: string; form: string; outcome: string; saved: boolean; maybeBot: string | null; fields: Record<string, unknown> };

export async function listSubmissions(): Promise<LoggedSubmission[]> {
  try {
    const { rows } = await db().query('select * from site_form_log order by created_at desc limit 500');
    return rows.map((r) => ({ id: String(r.id), createdAt: new Date(r.created_at).toISOString(), form: r.form, outcome: r.outcome, saved: r.saved, maybeBot: r.maybe_bot, fields: r.fields ?? {} }));
  } catch {
    return [];
  }
}
