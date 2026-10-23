// Builds the one paste Alex runs in the Supabase SQL editor: supabase/site_tables.sql with the real
// password for the website's database login, plus the starting events and their pages.
//
//   node scripts/make-paste.mjs <out-file>
//
// Reads SITE_DB_PASSWORD from site/.env.local. The output contains that password, so it is written
// outside the repo (Downloads) and never committed.
import { readFileSync, writeFileSync } from 'node:fs';

const out = process.argv[2];
if (!out) throw new Error('usage: node scripts/make-paste.mjs <out-file>');
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
const pw = env.SITE_DB_PASSWORD;
if (!pw || pw.length < 24 || /'/.test(pw)) throw new Error('SITE_DB_PASSWORD missing or unsuitable in .env.local');

const q = (v) => (v === null || v === undefined || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a, type) => `'{${(a ?? []).join(',')}}'::${type}[]`;
const seed = JSON.parse(readFileSync('src/content/seed-events.json', 'utf8'));

let sql = readFileSync('supabase/site_tables.sql', 'utf8').replaceAll('REPLACE_WITH_SITE_DB_PASSWORD', pw);
const lines = ['', '-- ---------- starting events (2026-10-23); safe to run again ----------', 'begin;'];
for (const p of seed.pages) {
  lines.push(
    `insert into public.site_event_pages (slug, title, summary, body, hero_image, layout, updated_by) values (${q(p.slug)}, ${q(p.title)}, ${q(p.summary)}, ${q(p.body)}, ${q(p.hero_image)}, ${q(p.layout)}, 'management') on conflict (slug) do nothing;`,
  );
}
for (const e of seed.events) {
  lines.push(
    `insert into public.site_events (page_id, title, category, starts_on, ends_on, start_time, end_time, repeat, weekdays, skip_holidays, skip_dates, offsite, location, note, ticket_url, updated_by)
  select p.id, ${q(e.title)}, ${q(e.category)}, ${q(e.starts_on)}, ${q(e.ends_on)}, ${q(e.start_time)}, ${q(e.end_time)}, ${q(e.repeat ?? 'none')}, ${arr(e.weekdays, 'smallint')}, ${e.skip_holidays ? 'true' : 'false'}, ${arr(e.skip_dates, 'date')}, ${e.offsite ? 'true' : 'false'}, ${q(e.location)}, ${q(e.note)}, ${q(e.ticket_url)}, 'management'
  from public.site_event_pages p where p.slug = ${q(e.page)}
  and not exists (select 1 from public.site_events x where x.page_id = p.id and x.title = ${q(e.title)} and x.starts_on = ${q(e.starts_on)});`,
  );
}
lines.push('commit;', '');
const header = `-- RR - PASTE: website calendar, event pages and careers (generated ${new Date().toISOString().slice(0, 10)}).\n-- Contains the website's database password: don't share or commit this file.\n\n`;
writeFileSync(out, header + sql + lines.join('\n'));
console.log(`wrote ${out}: ${seed.pages.length} pages, ${seed.events.length} events`);
