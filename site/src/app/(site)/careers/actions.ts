'use server';

import { dbReady } from '@/lib/db/pool';
import { addApplication } from '@/lib/events/store';
import { DEPARTMENTS } from '@/lib/events/types';

export type ApplyState = { ok: boolean; message: string } | null;

/** The Careers form: name, a way to reach them, and a department. Nothing more. */
export async function apply(_prev: ApplyState, form: FormData): Promise<ApplyState> {
  if (String(form.get('website') ?? '')) return { ok: true, message: 'Thanks. We’ll be in touch.' }; // honeypot
  const name = String(form.get('name') ?? '').trim().slice(0, 120);
  const email = String(form.get('email') ?? '').trim().slice(0, 160) || null;
  const phone = String(form.get('phone') ?? '').trim().slice(0, 40) || null;
  const department = String(form.get('department') ?? '');
  if (!name) return { ok: false, message: 'Please add your name.' };
  if (!email && !phone) return { ok: false, message: 'Please add an email or a phone number so we can reach you.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'That email doesn’t look right. Please check it.' };
  if (!(DEPARTMENTS as readonly string[]).includes(department)) return { ok: false, message: 'Please choose a department.' };
  if (!(await dbReady())) return { ok: false, message: 'Applications open here very soon. For now, email info@riverranchlodge.com with the department you’re applying for.' };
  try {
    await addApplication({ name, email, phone, department });
    return { ok: true, message: 'Thanks for applying. We’ll be in touch.' };
  } catch {
    return { ok: false, message: 'That didn’t go through. Please try again, or email info@riverranchlodge.com.' };
  }
}
