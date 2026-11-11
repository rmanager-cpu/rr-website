'use server';

import { dbReady } from '@/lib/db/pool';
import { addApplication } from '@/lib/events/store';
import { DEPARTMENTS, type ApplicationDetails } from '@/lib/events/types';
import { CERTS, DAYS, SEASONS, SHIFTS } from './options';

export type ApplyState = { ok: boolean; message: string } | null;

// The Careers application. California rules it follows (Fair Chance Act, Labor Code 432.3, FEHA): no
// conviction history before an offer, no past pay (pay hoped for is fine), and age only where the job needs
// it (18, and 21 for bartending). Resumes are optional; references and a bit about them are not.

const MAX_RESUME = 4 * 1024 * 1024; // Vercel takes request bodies up to 4.5 MB
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);
const pick = (f: FormData, k: string, allowed: readonly string[]) => f.getAll(k).map(String).filter((v) => allowed.includes(v));
const yesNo = (f: FormData, k: string) => (['yes', 'no'].includes(str(f, k, 3)) ? str(f, k, 3) : '');

/** What the file really is, from its first bytes (never trust the name or the browser's type). */
function sniff(b: Buffer): string | null {
  if (b.subarray(0, 4).toString('latin1') === '%PDF') return 'application/pdf';
  if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (b.subarray(0, 4).toString('hex') === 'd0cf11e0') return 'application/msword';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return 'image/png';
  if (b.subarray(4, 8).toString('latin1') === 'ftyp' && /^(heic|heix|mif1|msf1)/.test(b.subarray(8, 12).toString('latin1'))) return 'image/heic';
  return null;
}

export async function apply(_prev: ApplyState, form: FormData): Promise<ApplyState> {
  if (str(form, 'website', 10)) return { ok: true, message: 'Thanks. We’ll be in touch.' }; // honeypot

  const name = str(form, 'name', 120);
  const email = str(form, 'email', 160) || null;
  const phone = str(form, 'phone', 40) || null;
  const department = str(form, 'department', 40);
  if (!name) return { ok: false, message: 'Please add your name.' };
  if (!email && !phone) return { ok: false, message: 'Please add an email or a phone number so we can reach you.' };
  if (email && !EMAIL.test(email)) return { ok: false, message: 'That email doesn’t look right. Please check it.' };
  if (!(DEPARTMENTS as readonly string[]).includes(department)) return { ok: false, message: 'Please choose a department.' };

  const details: ApplicationDetails = {
    role: str(form, 'role', 140),
    seasons: pick(form, 'seasons', SEASONS),
    hours: ['Full time', 'Part time', 'Either'].includes(str(form, 'hours', 20)) ? str(form, 'hours', 20) : '',
    start: /^\d{4}-\d{2}-\d{2}$/.test(str(form, 'start', 10)) ? str(form, 'start', 10) : '',
    days: pick(form, 'days', DAYS),
    shifts: pick(form, 'shifts', SHIFTS),
    holidays: yesNo(form, 'holidays'),
    over18: yesNo(form, 'over18'),
    over21: yesNo(form, 'over21'),
    authorized: yesNo(form, 'authorized'),
    certs: pick(form, 'certs', CERTS),
    jobs: [0, 1].map((i) => ({ employer: str(form, `job${i}_employer`, 120), role: str(form, `job${i}_role`, 120), when: str(form, `job${i}_when`, 60) })).filter((j) => j.employer),
    refs: [0, 1, 2].map((i) => ({ name: str(form, `ref${i}_name`, 120), relation: str(form, `ref${i}_relation`, 160), contact: str(form, `ref${i}_contact`, 160) })),
    about: str(form, 'about', 2000),
    pay: str(form, 'pay', 80),
    town: str(form, 'town', 80),
    heard: str(form, 'heard', 120),
  };

  if (!details.seasons?.length) return { ok: false, message: 'Which seasons can you work? Pick at least one.' };
  if (!details.days?.length) return { ok: false, message: 'Which days can you work? Pick at least one.' };
  if (!details.over18) return { ok: false, message: 'Please tell us whether you’re 18 or older.' };
  if (!details.authorized) return { ok: false, message: 'Please tell us whether you can work in the U.S.' };
  if (details.refs!.some((r) => !r.name || !r.contact)) return { ok: false, message: 'Please add three references, each with a name and a phone or email.' };
  if ((details.about ?? '').length < 20) return { ok: false, message: 'Tell us a little about yourself, a couple of sentences is plenty.' };
  if (form.get('attest') !== 'yes') return { ok: false, message: 'Please confirm that everything here is true.' };

  let resume: { bytes: Buffer; filename: string; mime: string } | null = null;
  const file = form.get('resume');
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_RESUME) return { ok: false, message: 'That resume is over 4 MB. Try a PDF, or a smaller photo of it.' };
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = sniff(bytes);
    if (!mime) return { ok: false, message: 'Resumes can be a PDF, a Word file, or a photo (JPG, PNG or HEIC).' };
    const filename = (file.name || 'resume').replace(/[^\w.\- ()]/g, '_').slice(0, 200);
    resume = { bytes, filename, mime };
  }

  if (!(await dbReady())) return { ok: false, message: 'Applications open here very soon. For now, email info@riverranchlodge.com with the department you’re applying for.' };
  try {
    await addApplication({ name, email, phone, department, details, resume });
    return { ok: true, message: 'Thanks for applying. We read every one, and we’ll be in touch.' };
  } catch (e) {
    console.error('apply failed', e instanceof Error ? e.message : e);
    return { ok: false, message: 'That didn’t go through. Please try again, or email info@riverranchlodge.com.' };
  }
}
