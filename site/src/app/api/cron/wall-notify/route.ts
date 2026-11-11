import { NextResponse } from 'next/server';
import { business } from '@/content/site';
import { db } from '@/lib/db/pool';
import { mailReady, sendStaffMail, STAFF_INBOXES } from '@/lib/mail';

// Emails every staff inbox when someone tells us about a photo on The Wall. Vercel Cron calls this every
// ten minutes (vercel.json) with "Authorization: Bearer <CRON_SECRET>". Each new submission gets its own
// email, and notified_at is stamped once it has gone out, so nothing is sent twice. If mail isn't set up
// or a send fails, the rows wait for the next run.
export const dynamic = 'force-dynamic';

const TABLE_EDITOR = 'https://supabase.com/dashboard/project/wldjocyzgxtnnhxziduq/editor';
const BATCH = 20;

type Row = { id: string; created_at: Date; frame_id: string; section_id: string; story: string; name: string | null; contact: string | null; page: string | null };

/** "f41" is No. 41 on the wall; other frames keep their working name ("u-dogs"). */
const frameLabel = (id: string) => (/^f\d+$/.test(id) ? `No. ${id.slice(1)}` : id);

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!process.env.SITE_DATABASE_URL || !mailReady()) return NextResponse.json({ sent: 0, waiting: 'mail or database not set up' });

  const { rows } = await db().query<Row>(
    `select id, created_at, frame_id, section_id, story, name, contact, page from wall_submissions
     where notified_at is null order by created_at limit ${BATCH}`,
  );

  let sent = 0;
  for (const r of rows) {
    const when = r.created_at.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short' });
    const who = [r.name, r.contact].filter(Boolean).join(', ') || 'No name or contact left';
    const email = r.contact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.contact) ? r.contact : undefined;
    try {
      await sendStaffMail({
        to: STAFF_INBOXES,
        subject: `The Wall: someone knows ${frameLabel(r.frame_id)}`,
        replyTo: email,
        text: [
          `Someone told us about a photo on The Wall (${when}).`,
          '',
          `Photo: ${frameLabel(r.frame_id)} (frame ${r.frame_id}, section ${r.section_id})`,
          `From: ${who}`,
          '',
          r.story,
          '',
          email ? 'Reply to this email to answer them.' : '',
          `See The Wall: ${business.links.theWall}`,
          `Review and approve it (status, notes, the 10% thank-you code): ${TABLE_EDITOR}`,
          '',
          'Sent by the River Ranch website.',
        ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n'),
      });
      await db().query('update wall_submissions set notified_at = now() where id = $1', [r.id]);
      sent++;
    } catch (e) {
      console.error('wall-notify: send failed', e instanceof Error ? e.message : e);
      break; // try again next run
    }
  }
  return NextResponse.json({ sent, checked: rows.length });
}
