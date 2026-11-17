import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const DEMO_COOKIE = 'rr_booking_demo';
export const DEMO_HOURS = 8;
export const enabled = () => process.env.VERCEL_ENV !== 'production';
export const configured = () => enabled() && (process.env.DEMO_PASSWORD?.length ?? 0) >= 16 && (process.env.DEMO_SESSION_SECRET?.length ?? 0) >= 32;
const equal = (a: string, b: string) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
const sign = (expiry: string) => createHmac('sha256', process.env.DEMO_SESSION_SECRET ?? '').update(`booking-demo:${expiry}:${process.env.DEMO_PASSWORD ?? ''}`).digest('hex');
export function checkDemoPassword(password: string) { return configured() && equal(password, process.env.DEMO_PASSWORD!); }
export function sameOrigin(request: Request) {
  try {
    const origin = new URL(request.headers.get('origin') ?? '');
    return ['http:', 'https:'].includes(origin.protocol) && origin.host === request.headers.get('host') && (!process.env.VERCEL || origin.protocol === 'https:');
  } catch { return false; }
}
export function demoSession() {
  const expiry = String(Date.now() + DEMO_HOURS * 3600000);
  return `${expiry}.${sign(expiry)}`;
}
export function hasDemoAccess() {
  if (!configured()) return false;
  const [expiry, signature, extra] = (cookies().get(DEMO_COOKIE)?.value ?? '').split('.');
  return !extra && /^\d{13}$/.test(expiry ?? '') && Number(expiry) > Date.now() && Number(expiry) <= Date.now() + DEMO_HOURS * 3600000 && Boolean(signature) && equal(signature, sign(expiry));
}
const hits = new Map<string, { at: number; count: number }>();
// Best-effort per-process throttling, supplemented by hosting protection; not a distributed rate limiter.
export function rateLimited(key: string, limit = 20) {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const old = hits.get(key);
  if (!old || now - old.at > 60000) { hits.set(key, { at: now, count: 1 }); return false; }
  return ++old.count > limit;
}
