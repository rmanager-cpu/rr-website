import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { requireAdmin } from '@/lib/admin/session';
import { downloadable, guestPdfPath, PARTNERS, stylesThatFit } from '@/lib/menus/pdf';
import { defaultTheme } from '@/lib/menus/print';
import { menuBySlug, type Menu } from '@/lib/menus/store';

// Pick a style, see the PDF, download or print it. The PDF itself comes from ./pdf.
// Only the styles the menu fits in are offered (a page that runs over is tried in two columns first).
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const THEMES = [
  { id: 'classic', label: 'Classic' },
  { id: 'fireside', label: 'Fireside' },
  { id: 'trailhead', label: 'Trailhead' },
  { id: 'band', label: 'Band' },
];
const PAPER: Record<string, string> = { letter: 'letter', legal: 'legal', 'half-letter': 'half-sheet' };
const bar = { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', padding: '12px 16px' } as const;

export default async function PrintMenu({ params, searchParams }: { params: { slug: string }; searchParams: { theme?: string } }) {
  requireAdmin();
  const menu = await menuBySlug(params.slug, { includeInactive: true });
  if (!menu) notFound();
  const head = (
    <>
      <Link href={`/admin/menus/${menu.slug}`}>← Back to the menu</Link>
      <strong>{menu.name}</strong>
    </>
  );
  return (
    <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', font: '16px system-ui, sans-serif' }}>
      <Suspense fallback={<div style={bar}>{head}<span>Checking which styles it fits…</span></div>}>
        <Styles menu={menu} asked={searchParams.theme} head={head} />
      </Suspense>
    </main>
  );
}

async function Styles({ menu, asked, head }: { menu: Menu; asked?: string; head: React.ReactNode }) {
  const fits = await stylesThatFit(menu);
  const offered = THEMES.filter((t) => fits[t.id]?.ok);
  const saved = defaultTheme(menu);
  const theme = offered.find((t) => t.id === asked)?.id ?? offered.find((t) => t.id === saved)?.id ?? offered[0]?.id;
  const paper = PAPER[menu.print?.size ?? 'letter'] ?? 'letter';

  if (!theme) {
    return (
      <>
        <div style={bar}>{head}</div>
        <p style={{ padding: '0 16px', maxWidth: 640 }}>
          This menu is too long for {paper} paper in every style, even in two columns. Trim some items, or choose a bigger paper size in the menu’s settings.
        </p>
      </>
    );
  }

  const pdf = `/admin/print/menus/${menu.slug}/pdf?theme=${theme}`;
  const halfSheet = menu.print?.size === 'half-letter';
  const widened = fits[theme].widened;
  const today = new Date().toISOString().slice(0, 10);
  const onWebsite = downloadable(menu) && menu.active && (!menu.showUntil || menu.showUntil >= today);
  return (
    <>
      <div style={bar}>
        {head}
        {offered.map((t) => (
          <Link key={t.id} href={`?theme=${t.id}`} aria-current={t.id === theme ? 'true' : undefined} style={{ fontWeight: t.id === theme ? 700 : 400 }}>{t.label}</Link>
        ))}
        <a href={pdf} target="_blank" rel="noopener" style={{ fontWeight: 700 }}>Open PDF to print or send</a>
        {halfSheet && <a href={`${pdf}&layout=copies`} target="_blank" rel="noopener">2 copies per sheet</a>}
        {halfSheet && <a href={`${pdf}&layout=cut`} target="_blank" rel="noopener">One page per half</a>}
      </div>
      {(widened.length > 0 || onWebsite) && (
        <div style={{ ...bar, paddingTop: 0, fontSize: 14 }}>
          {widened.length > 0 && <span>Page {widened.join(' and ')} is set in two columns so it fits.</span>}
          {onWebsite && (
            <span>
              Guest copy (always Classic, with logo and contact line):<a href={guestPdfPath(menu.slug)} target="_blank" rel="noopener">website download</a>
              {Object.entries(PARTNERS).map(([key, p]) => (
                <span key={key}> · <a href={guestPdfPath(menu.slug, key)} target="_blank" rel="noopener">{p.label} copy</a></span>
              ))}
            </span>
          )}
        </div>
      )}
      <iframe key={theme} src={pdf} title={`${menu.name} print preview`} style={{ flex: 1, border: 0, width: '100%' }} />
    </>
  );
}
