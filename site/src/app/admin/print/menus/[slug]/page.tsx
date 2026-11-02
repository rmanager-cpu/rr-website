import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/session';
import { defaultTheme } from '@/lib/menus/print';
import { menuBySlug } from '@/lib/menus/store';

// Pick a style, see the PDF, download or print it. The PDF itself comes from ./pdf.
export const dynamic = 'force-dynamic';

const THEMES = [
  { id: 'classic', label: 'Classic' },
  { id: 'fireside', label: 'Fireside' },
  { id: 'trailhead', label: 'Trailhead' },
  { id: 'band', label: 'Band' },
];

export default async function PrintMenu({ params, searchParams }: { params: { slug: string }; searchParams: { theme?: string } }) {
  requireAdmin();
  const menu = await menuBySlug(params.slug, { includeInactive: true });
  if (!menu) notFound();
  const theme = THEMES.some((t) => t.id === searchParams.theme) ? searchParams.theme! : defaultTheme(menu);
  const pdf = `/admin/print/menus/${menu.slug}/pdf?theme=${theme}`;
  const halfSheet = menu.print?.size === 'half-letter';
  return (
    <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', font: '16px system-ui, sans-serif' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', padding: '12px 16px' }}>
        <Link href={`/admin/menus/${menu.slug}`}>← Back to the menu</Link>
        <strong>{menu.name}</strong>
        {THEMES.map((t) => (
          <Link key={t.id} href={`?theme=${t.id}`} aria-current={t.id === theme ? 'true' : undefined} style={{ fontWeight: t.id === theme ? 700 : 400 }}>{t.label}</Link>
        ))}
        <a href={pdf} target="_blank" rel="noopener" style={{ fontWeight: 700 }}>Open PDF to print or send</a>
        {halfSheet && <a href={`${pdf}&layout=copies`} target="_blank" rel="noopener">2 copies per sheet</a>}
        {halfSheet && <a href={`${pdf}&layout=cut`} target="_blank" rel="noopener">One page per half</a>}
      </div>
      <iframe key={theme} src={pdf} title={`${menu.name} print preview`} style={{ flex: 1, border: 0, width: '100%' }} />
    </main>
  );
}
