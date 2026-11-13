'use server';

import { business } from '@/content/site';
import { formFields, logSubmission } from '@/lib/form-log';
import { mailReady, sendStaffMail } from '@/lib/mail';

export type AskState = { ok: boolean; message: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const s = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);

// "Ask about your date" on /celebrate/weddings: the way to the wedding packet until Venio's wedding calendar and
// packet form are embedded. Each send is emailed to events@ (reply goes straight to the couple) and recorded in
// the form log (/admin/submissions). Nothing is dropped: a filled hidden box only labels it "maybe bot".
export async function askAboutDate(_prev: AskState, f: FormData): Promise<AskState> {
  const maybeBot = s(f, 'website', 10) ? 'hidden box filled' : null;
  const fields = formFields(f);
  const no = async (message: string) => {
    await logSubmission({ form: 'wedding-date', outcome: message, saved: false, maybeBot, fields });
    return { ok: false, message };
  };

  const name = s(f, 'name', 120);
  const email = s(f, 'email', 160);
  const phone = s(f, 'phone', 40);
  const date = s(f, 'date', 200);
  const guests = s(f, 'guests', 40);
  const message = s(f, 'message', 3000);
  if (!name) return no('Please add your name.');
  if (!email && !phone) return no('Please add an email or a phone number so we can send the packet.');
  if (email && !EMAIL.test(email)) return no('That email doesn’t look right. Please check it.');

  let mailed = false;
  if (mailReady()) {
    try {
      const lines = [
        maybeBot ? 'Maybe a bot: the hidden box was filled (phone autofill does this too).' : null,
        `Name: ${name}`,
        `Email: ${email || '(none)'}`,
        `Phone: ${phone || '(none)'}`,
        `Date in mind: ${date || '(not given)'}`,
        `Guests: ${guests || '(not given)'}`,
        message ? `\n${message}` : null,
        '\nThey asked about their date on the Weddings page and were told the events team will email the wedding packet.',
      ].filter(Boolean);
      await sendStaffMail({
        to: [business.email.events],
        subject: `${maybeBot ? '[maybe bot] ' : ''}Wedding: ${name} asked about ${date || 'a date'}${guests ? `, ${guests} guests` : ''}`,
        text: lines.join('\n'),
        replyTo: email || undefined,
      });
      mailed = true;
    } catch (e) {
      console.error('askAboutDate: mail failed', e instanceof Error ? e.message : e);
    }
  }
  const ok = 'Thank you. The events team will check the calendar for your date and email you the wedding packet.';
  // The log is this request's home in /admin (Every submission). `_emailed` isn't something they typed: it tells
  // staff whether events@ got it, so one that wasn't emailed can still be answered from here.
  const logged = await logSubmission({ form: 'wedding-date', outcome: ok, saved: true, maybeBot, fields: { ...fields, _emailed: mailed ? 'yes' : 'no' } });
  if (mailed || logged) return { ok: true, message: ok };
  return { ok: false, message: `That didn’t go through. Please call us at ${business.phone} or email ${business.email.events}.` };
}
