import { NextResponse, type NextRequest } from 'next/server';
import { isSignedIn } from '@/lib/admin/session';
import { defaultTheme, toPrintMenu } from '@/lib/menus/print';
import { menuBySlug } from '@/lib/menus/store';
import { buildMenu, THEME_IDS } from '@/lib/print-menu/build.mjs';

// The print-ready PDF for one menu, built fresh from the editor's data. Staff-only.
//   ?theme=classic|fireside|trailhead|band   defaults to the menu's saved style
//   ?layout=copies|cut                       half-sheet menus only: 2 copies per sheet, or one page per half
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isSignedIn()) return new NextResponse('Sign in first.', { status: 401 });
  const menu = await menuBySlug(params.slug, { includeInactive: true });
  if (!menu) return new NextResponse('No such menu.', { status: 404 });

  const asked = req.nextUrl.searchParams.get('theme') ?? '';
  const theme = THEME_IDS.includes(asked) ? asked : defaultTheme(menu);
  const result = await buildMenu(toPrintMenu(menu), theme);

  if (!result.ok || !result.pdf) {
    const lines = result.report.filter((p) => !p.fits).map((p) =>
      p.reason === 'corner'
        ? `${p.label}: text sits under a corner pocket.`
        : `${p.label}: over by ${p.itemsOver} item(s) at the ${result.floorPt}pt minimum. Cut or move items.`,
    );
    const body = `<!doctype html><meta charset="utf-8"><body style="font:16px system-ui;padding:24px"><h1 style="font-size:20px">This menu doesn’t fit in this style</h1><ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul><p>Try another style, or trim the menu.</p></body>`;
    return new NextResponse(body, { status: 422, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const layout = req.nextUrl.searchParams.get('layout');
  const halfSheet = Boolean(result.printPdf);
  const bytes = !halfSheet || layout === 'cut' ? result.pdf : layout === 'copies' ? result.printCopiesPdf! : result.printPdf!;
  const name = `${menu.slug}-${theme}${halfSheet && layout ? `-${layout}` : ''}.pdf`;
  return new NextResponse(Buffer.from(bytes), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${name}"`, 'Cache-Control': 'no-store' },
  });
}
