import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { business, SITE_URL } from '@/content/site';
import { db } from '@/lib/db/pool';
import { mailReady, sendStaffMail, STAFF_INBOXES, type InlineImage } from '@/lib/mail';

// Emails every staff inbox when someone tells us about a photo on The Wall. Vercel Cron calls this every
// ten minutes (vercel.json) with "Authorization: Bearer <CRON_SECRET>". Each new submission gets its own
// email, and notified_at is stamped once it has gone out, so nothing is sent twice. If mail isn't set up
// or a send fails, the rows wait for the next run.
export const dynamic = 'force-dynamic';

const TABLE_EDITOR = 'https://supabase.com/dashboard/project/wldjocyzgxtnnhxziduq/editor';
const BATCH = 20;
/** The Wall as it sits on our own site (the History page embeds it). */
const WALL_ON_SITE = `${SITE_URL}/history`;
const SITE_NAME = SITE_URL.replace(/^https?:\/\//, '');

type Row = { id: string; created_at: Date; frame_id: string; section_id: string; story: string; name: string | null; contact: string | null; page: string | null };

/** "f41" is No. 41 on the wall; other frames keep their working name ("u-dogs"). */
const frameLabel = (id: string) => (/^f\d+$/.test(id) ? `No. ${id.slice(1)}` : id);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * The frame's close-up from The Wall app, as a JPEG to show inside the email (WebP doesn't display in every
 * mail app). Every frame on the wall has one at frames/<id>.webp. Null if it can't be fetched: the email
 * still goes out, just without the picture.
 */
async function framePhoto(frameId: string): Promise<InlineImage | null> {
  if (!/^[a-z0-9-]+$/i.test(frameId)) return null;
  try {
    const res = await fetch(`${business.links.theWall}/frames/${frameId}.webp`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
    return { cid: 'wall-frame', filename: `${frameId}.jpg`, content: jpeg, contentType: 'image/jpeg' };
  } catch {
    return null;
  }
}

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
    const label = frameLabel(r.frame_id);
    const photo = await framePhoto(r.frame_id);

    const text = [
      `Someone told us about a photo on The Wall (${when}).`,
      '',
      `Photo: ${label} (frame ${r.frame_id}, section ${r.section_id})`,
      `From: ${who}`,
      '',
      r.story,
      '',
      email ? 'Reply to this email to answer them.' : '',
      `See The Wall on our website: ${WALL_ON_SITE}`,
      `Review and approve it (status, notes, the 10% thank-you code): ${TABLE_EDITOR}`,
      '',
      `Sent by the River Ranch website, ${SITE_NAME}`,
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');

    const p = 'margin:0 0 14px';
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1d1d1b;max-width:600px">
<p style="${p}">Someone told us about a photo on The Wall (${esc(when)}).</p>
${photo ? `<p style="${p}"><img src="cid:${photo.cid}" alt="${esc(label)} on The Wall" style="display:block;max-width:100%;height:auto;border:1px solid #ddd"></p>` : ''}
<p style="${p}"><strong>Photo:</strong> ${esc(label)} <span style="color:#777">(frame ${esc(r.frame_id)}, section ${esc(r.section_id)})</span><br><strong>From:</strong> ${esc(who)}</p>
<blockquote style="margin:0 0 14px;padding:10px 14px;border-left:3px solid #2c5f3f;background:#f7f9fa;white-space:pre-wrap">${esc(r.story)}</blockquote>
${email ? `<p style="${p}">Reply to this email to answer them.</p>` : ''}
<p style="${p}"><a href="${WALL_ON_SITE}">See The Wall on our website</a> &middot; <a href="${TABLE_EDITOR}">Review and approve it</a> <span style="color:#777">(status, notes, the 10% thank-you code)</span></p>
<p style="margin:0;color:#777;font-size:13px">Sent by the River Ranch website, <a href="${SITE_URL}" style="color:#777">${SITE_NAME}</a></p>
</div>`;

    try {
      await sendStaffMail({
        to: STAFF_INBOXES,
        subject: `The Wall: someone knows ${label}`,
        replyTo: email,
        text,
        html,
        images: photo ? [photo] : undefined,
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
