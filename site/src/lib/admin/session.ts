import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Staff sign-in for /admin: one shared password (SITE_ADMIN_PASSWORD), then a signed cookie good for
// 12 hours. The cookie is an HMAC of its expiry with SITE_ADMIN_SECRET, so it can't be forged.
const COOKIE = 'rr_site_admin';
const HOURS = 12;

const secret = () => process.env.SITE_ADMIN_SECRET || '';
const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const adminConfigured = () => Boolean(process.env.SITE_ADMIN_PASSWORD && secret().length >= 16);

export function checkPassword(pw: string) {
  const want = process.env.SITE_ADMIN_PASSWORD || '';
  return adminConfigured() && safeEqual(pw, want);
}

export function startSession() {
  const exp = String(Date.now() + HOURS * 3600_000);
  cookies().set(COOKIE, `${exp}.${sign(exp)}`, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: HOURS * 3600 });
}

export function endSession() {
  cookies().delete(COOKIE);
}

export function isSignedIn(): boolean {
  if (!adminConfigured()) return false;
  const v = cookies().get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split('.');
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now();
}

export function requireAdmin() {
  if (!isSignedIn()) redirect('/admin/login');
}

/** Who made a change, for the record. Staff-facing, never shown publicly. */
export const editor = () => 'management';
