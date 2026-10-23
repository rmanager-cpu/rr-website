import 'server-only';
import { Pool } from 'pg';

// The website's own database login (rr_site_app), which reaches only the site_* tables. Until the site
// tables paste has been run (or if the database is unreachable), the site falls back to the built-in
// starting data (src/content/seed-events.json), so public pages never break.
let pool: Pool | null = null;
let checked: { ok: boolean; at: number } | null = null;

export function db(): Pool {
  if (!process.env.SITE_DATABASE_URL) throw new Error('SITE_DATABASE_URL is not set');
  pool ??= new Pool({ connectionString: process.env.SITE_DATABASE_URL, max: 3, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
  return pool;
}

/** Is the calendar database set up and reachable? Rechecked at most once a minute. */
export async function dbReady(): Promise<boolean> {
  if (!process.env.SITE_DATABASE_URL) return false;
  if (checked && Date.now() - checked.at < 60_000) return checked.ok;
  try {
    await db().query('select 1 from site_events limit 1');
    checked = { ok: true, at: Date.now() };
  } catch (e) {
    console.error('site database not ready:', e instanceof Error ? e.message : e);
    checked = { ok: false, at: Date.now() };
  }
  return checked.ok;
}
