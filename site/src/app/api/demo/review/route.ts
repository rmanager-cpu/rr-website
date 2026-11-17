import { NextRequest, NextResponse } from 'next/server';
import { hasDemoAccess, rateLimited, sameOrigin } from '@/lib/demo/access';
import { availability } from '@/lib/demo/inventory';
import { packageTotal, readSearch } from '@/lib/demo/package';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
export async function POST(req: NextRequest) {
  if (!hasDemoAccess()) return json({ error: 'Sign in to the private demo.' }, 401);
  if (!sameOrigin(req)) return json({ error: 'Invalid request origin.' }, 403);
  if (rateLimited('review:' + req.headers.get('x-forwarded-for'), 10)) return json({ error: 'Please wait a minute before checking again.' }, 429);
  let body, q;
  try { body = await req.json(); q = readSearch(body.search); }
  catch { return json({ error: 'Invalid package request.' }, 400); }
  let fresh;
  try { fresh = await availability(q); }
  catch (e) { return json({ error: (e as Error).message }, 503); }
  try {
    const total = packageTotal(fresh.rooms, body.selection, q, body.ticketPeople, body.ticketDays);
    // Read-only: no reservation, group block, payment, email or lift ticket is created here.
    return json({ total, checkedAt: fresh.checkedAt, source: fresh.source, reserved: false });
  } catch (e) { return json({ error: (e as Error).message }, 409); }
}
