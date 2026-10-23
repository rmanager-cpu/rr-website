'use server';

import { dbReady } from '@/lib/db/pool';
import { addBookingRequest } from '@/lib/events/store';

export type BookState = { ok: boolean; message: string } | null;

const s = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max) || null;

/** "Request to play" from the Summer Concert Series page. */
export async function requestToPlay(_prev: BookState, f: FormData): Promise<BookState> {
  if (s(f, 'website', 10)) return { ok: true, message: 'Thanks. We’ll be in touch.' }; // honeypot
  const actName = s(f, 'act_name', 140);
  const contact = s(f, 'contact', 120);
  const email = s(f, 'email', 160);
  const phone = s(f, 'phone', 40);
  if (!actName) return { ok: false, message: 'Add your band or act’s name.' };
  if (!contact) return { ok: false, message: 'Add a contact name.' };
  if (!email && !phone) return { ok: false, message: 'Add an email or phone so we can reach you.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'That email doesn’t look right. Please check it.' };
  if (!(await dbReady())) return { ok: false, message: 'Booking requests open here very soon. For now, email events@riverranchlodge.com with your links.' };
  try {
    await addBookingRequest({ actName, contact, email, phone, genre: s(f, 'genre', 140), hometown: s(f, 'hometown', 140), links: s(f, 'links', 1000), dates: s(f, 'dates', 400), message: s(f, 'message', 4000) });
    return { ok: true, message: 'Got it. We listen to everything that comes in, and we’ll reach out if it’s a fit for the season.' };
  } catch {
    return { ok: false, message: 'That didn’t go through. Please try again, or email events@riverranchlodge.com.' };
  }
}
