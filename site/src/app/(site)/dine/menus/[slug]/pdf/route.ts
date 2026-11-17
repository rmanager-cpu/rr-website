import { NextResponse, type NextRequest } from 'next/server';
import { downloadable, guestPdf, guestPdfPath, PARTNERS } from '@/lib/menus/pdf';
import { menuBySlug } from '@/lib/menus/store';

// Download PDF: the guest copy of a menu that's on the website. Banquet menus, templates, switched-off
// and past-date menus don't exist here. ?partner=tahoe gives a partner's copy (tagged links); any other
// address extras send you to the plain address, so every copy has one address and is made once.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const q = req.nextUrl.searchParams;
  const partner = q.get('partner') ?? undefined;
  const known = partner && Object.prototype.hasOwnProperty.call(PARTNERS, partner) ? partner : undefined;
  if ([...q.keys()].some((k) => k !== 'partner') || q.getAll('partner').length > 1 || (partner && !known)) {
    return NextResponse.redirect(new URL(guestPdfPath(params.slug, known), req.nextUrl.origin), 308);
  }

  const menu = await menuBySlug(params.slug); // only menus on the website
  if (!menu || !downloadable(menu)) return new NextResponse('No such menu.', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });

  const r = await guestPdf(menu, known);
  // It doesn't fit any style right now: the menu page itself is the next best thing.
  if (!r.ok) return NextResponse.redirect(new URL(`/dine/menus/${menu.slug}`, req.nextUrl.origin), 307);

  const name = `river-ranch-${menu.slug}${known ? `-${known}` : ''}.pdf`;
  return new NextResponse(Buffer.from(r.pdf, 'base64'), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${name}"`,
      // Kept at the edge for five minutes like the menu pages; menus change rarely.
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
      'X-Robots-Tag': 'noindex', // the menu pages are what search engines should show
    },
  });
}
