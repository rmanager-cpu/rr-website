import { NextRequest, NextResponse } from 'next/server';
import { checkDemoPassword, configured, DEMO_COOKIE, DEMO_HOURS, demoSession, enabled, rateLimited, sameOrigin } from '@/lib/demo/access';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });
  if (!sameOrigin(req)) return new NextResponse(null, { status: 403 });
  const form = await req.formData();
  const origin = req.headers.get('origin')!;
  const response = NextResponse.redirect(new URL(form.get('action') === 'logout' ? '/demo' : '/stay/rooms#group-booking', origin), 303);
  response.headers.set('Cache-Control', 'no-store');
  if (form.get('action') === 'logout') { response.cookies.delete(DEMO_COOKIE); return response; }
  if (!configured()) return new NextResponse('Demo access is not configured.', { status: 503 });
  if (rateLimited('login:' + req.headers.get('x-forwarded-for'), 8)) return new NextResponse('Too many attempts. Try again in a minute.', { status: 429 });
  const password = form.get('password');
  if (typeof password !== 'string' || password.length > 256 || !checkDemoPassword(password)) return NextResponse.redirect(new URL('/demo?error=1', origin), 303);
  response.cookies.set(DEMO_COOKIE, demoSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: DEMO_HOURS * 3600 });
  return response;
}
