import { NextRequest, NextResponse } from 'next/server';
import { hasDemoAccess, rateLimited } from '@/lib/demo/access';
import { availability } from '@/lib/demo/inventory';
import { readSearch } from '@/lib/demo/package';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
export async function GET(req: NextRequest) {
  if (!hasDemoAccess()) return json({ error: 'Sign in to the private demo.' }, 401);
  if (rateLimited('availability:' + req.headers.get('x-forwarded-for'))) return json({ error: 'Please wait a minute before checking again.' }, 429);
  let q;
  try { q = readSearch(Object.fromEntries(req.nextUrl.searchParams)); }
  catch (e) { return json({ error: (e as Error).message }, 400); }
  try { return json(await availability(q)); }
  catch (e) { return json({ error: (e as Error).message }, 503); }
}
