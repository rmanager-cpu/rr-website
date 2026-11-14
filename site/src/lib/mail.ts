import 'server-only';
import nodemailer from 'nodemailer';

// Staff alerts go out through the company's Google Workspace mail: SMTP_USER is a riverranchlodge.com
// mailbox and SMTP_PASS a Google app password for it (myaccount.google.com/apppasswords). Both live only in
// .env.local and Vercel. Without them nothing is sent, and the alert waits for the next run.

/** Every role mailbox at River Ranch. */
export const STAFF_INBOXES = [
  'rmanager@riverranchlodge.com',
  'lodgemanager@riverranchlodge.com',
  'officemanager@riverranchlodge.com',
  'frontdesk@riverranchlodge.com',
  'events@riverranchlodge.com',
  'info@riverranchlodge.com',
];

/** Who gets The Wall's alerts. For now only rmanager@ (Alex, 2026-11-14); swap in STAFF_INBOXES to tell everyone. */
export const WALL_ALERT_INBOXES = ['rmanager@riverranchlodge.com'];

export const mailReady = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;

/** An image shown inside the email body: reference it in `html` as <img src="cid:CID">. */
export type InlineImage = { cid: string; filename: string; content: Buffer; contentType: string };

export async function sendStaffMail(m: { to: string[]; subject: string; text: string; html?: string; images?: InlineImage[]; replyTo?: string }) {
  if (!mailReady()) throw new Error('SMTP_USER and SMTP_PASS are not set');
  transport ??= nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: `"River Ranch website" <${process.env.SMTP_USER}>`,
    to: m.to.join(', '),
    subject: m.subject,
    text: m.text,
    html: m.html,
    attachments: m.images?.map((i) => ({ ...i, contentDisposition: 'inline' as const })),
    replyTo: m.replyTo,
  });
}
