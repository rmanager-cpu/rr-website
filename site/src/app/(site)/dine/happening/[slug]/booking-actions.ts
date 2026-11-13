'use server';

import { dbReady } from '@/lib/db/pool';
import { addBookingRequest } from '@/lib/events/store';
import { formFields, logSubmission } from '@/lib/form-log';

export type BookState = { ok: boolean; message: string } | null;

/** Put at the top of a request's message when the hidden box was filled; /admin/bookings shows it as a tag. */
const MAYBE_BOT = '[maybe bot: hidden box filled]';

const s = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max) || null;

// Nothing anyone sends is ever dropped (management's rule, 2026-11-12). Every send is recorded in the form
// log (/admin/submissions) exactly as typed, including one sent back to fix something. Bots fill the hidden
// box, but so does phone autofill, so a filled box only labels the request "maybe bot"; it is still saved.

/** "Request to play" from the Summer Concert Series page. */
export async function requestToPlay(_prev: BookState, f: FormData): Promise<BookState> {
  const maybeBot = s(f, 'website', 10) ? 'hidden box filled' : null;
  const r = await check(f, maybeBot);
  await logSubmission({ form: 'request-to-play', outcome: r.message, saved: r.saved, maybeBot, fields: formFields(f) });
  return { ok: r.ok, message: r.message };
}

async function check(f: FormData, maybeBot: string | null): Promise<{ ok: boolean; message: string; saved: boolean }> {
  const no = (message: string) => ({ ok: false, message, saved: false });
  const actName = s(f, 'act_name', 140);
  const contact = s(f, 'contact', 120);
  const email = s(f, 'email', 160);
  const phone = s(f, 'phone', 40);
  if (!actName) return no('Add your band or act’s name.');
  if (!contact) return no('Add a contact name.');
  if (!email && !phone) return no('Add an email or phone so we can reach you.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return no('That email doesn’t look right. Please check it.');
  if (!(await dbReady())) return no('Booking requests open here very soon. For now, email events@riverranchlodge.com with your links.');
  try {
    const message = [maybeBot ? MAYBE_BOT : null, s(f, 'message', 3900)].filter(Boolean).join('\n\n') || null;
    await addBookingRequest({ actName, contact, email, phone, genre: s(f, 'genre', 140), hometown: s(f, 'hometown', 140), links: s(f, 'links', 1000), dates: s(f, 'dates', 400), message });
    return { ok: true, message: 'Got it. We listen to everything that comes in, and we’ll reach out if it’s a fit for the season.', saved: true };
  } catch (e) {
    console.error('requestToPlay failed', e instanceof Error ? e.message : e);
    return no('That didn’t go through. Please try again, or email events@riverranchlodge.com.');
  }
}
