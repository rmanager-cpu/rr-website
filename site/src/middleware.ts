import { NextRequest, NextResponse } from 'next/server';
import { isBookingDemo } from '@/lib/demo/mode';

/** The review deployment serves only the demo, never the copied site's forms or staff tools.
 * Production and other branches retain their existing routing. The demo pages themselves also
 * reject VERCEL_ENV=production, independently of this middleware.
 */
export function middleware(req: NextRequest) {
  if (!isBookingDemo()) return NextResponse.next();
  const path = req.nextUrl.pathname;
  const headers = { 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Cache-Control': 'private, no-store' };
  if (path.startsWith('/stay') && !['GET', 'HEAD'].includes(req.method)) return new NextResponse(null, { status: 405, headers });
  if (path === '/') return NextResponse.redirect(new URL('/stay/rooms', req.url), { headers });
  if (['/demo', '/demo/', '/stay', '/stay/rooms', '/stay/packages', '/stay/guest-info'].includes(path) || path.startsWith('/api/demo/')) {
    const response = NextResponse.next();
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }
  if (path.startsWith('/_next/static/') || path === '/_next/image' || path.startsWith('/photos/') || path.startsWith('/brand/') || path === '/favicon.ico') return NextResponse.next();
  return new NextResponse('Not available in this private demo.', { status: 404, headers });
}
