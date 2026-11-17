import 'server-only';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { unstable_cache } from 'next/cache';
import { business, SITE_URL } from '@/content/site';
import { buildFirstFit, checkThemes, THEME_IDS, type PdfMeta } from '@/lib/print-menu/build.mjs';
import { toPrintMenu } from './print';
import type { Menu } from './store';

// The menu PDFs guests download from the website, and the facts staff see about which styles fit.
// Same engine as the staff print; guest copies are always Classic and add the logo and a contact line.

/** Partner copies: the same PDF, with its links to our site tagged so visits from that copy show up in
 * analytics. Only these keys work (?partner=tahoe); anything else gets the plain copy's address. */
export const PARTNERS: Record<string, { label: string; source: string }> = {
  tahoe: { label: 'Tahoe.com', source: 'tahoe.com' },
};

/** Guests can download a menu that's on the website (switched on, in date) and is regular or holiday.
 * Never a banquet menu, never a template. listMenus() already leaves out what isn't on the website. */
export const downloadable = (m: Menu) => (m.kind === 'regular' || m.kind === 'holiday') && !m.slug.endsWith('-template');

export const guestPdfPath = (slug: string, partner?: string) => `/dine/menus/${slug}/pdf${partner ? `?partner=${partner}` : ''}`;

const where = `${business.address.city}, ${business.address.region}`;

export function pdfMeta(menu: Menu): PdfMeta {
  return {
    title: `${menu.name} | ${business.name}`,
    author: business.name,
    subject: `${menu.name} at ${business.name}, ${where}${menu.servingNote ? `. ${menu.servingNote}` : ''}`,
    keywords: [business.name, menu.name, `${business.address.city} restaurant`, 'Lake Tahoe', 'Truckee River', 'menu'],
  };
}

let logo: string | null = null;
const logoDataUrl = () => (logo ??= `data:image/png;base64,${readFileSync(path.join(process.cwd(), 'print-assets/river-ranch-logo.png')).toString('base64')}`);

/** Our own links, tagged for a partner copy. Phone and map links are left alone. */
function tagged(url: string, menu: Menu, partner?: string) {
  const p = partner ? PARTNERS[partner] : undefined;
  if (!p) return url;
  const u = new URL(url);
  u.searchParams.set('utm_source', p.source);
  u.searchParams.set('utm_medium', 'referral');
  u.searchParams.set('utm_campaign', 'menu_pdf');
  u.searchParams.set('utm_content', menu.slug);
  return u.toString();
}

/** The print engine's menu, dressed for guests: logo up top, website · phone · address at the bottom,
 * and the menu's name on the first page if that page has no title of its own. */
export function guestPrintMenu(menu: Menu, partner?: string) {
  const pm = toPrintMenu(menu);
  const a = business.address;
  const home = tagged(`${SITE_URL}/`, menu, partner);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${a.street}, ${a.city}, ${a.region} ${a.postalCode}`)}`;
  return {
    ...pm,
    pages: pm.pages.map((p, i) => (i === 0 && !p.title ? { ...p, title: menu.name } : p)),
    guest: {
      logo: logoDataUrl(),
      home,
      contact: [
        { text: new URL(SITE_URL).hostname.replace(/^www\./, ''), href: home },
        { text: business.phone, href: `tel:${business.phoneE164}` },
        { text: `${a.street}, ${a.city}`, href: maps },
      ],
    },
  };
}

// Results are kept (shared by every server) under a fingerprint of exactly what goes on the page, so a
// change to the menu, its layout, or this code makes a new one. MENU_PDF_BUILD changes with every build.
const fingerprint = (...parts: unknown[]) =>
  createHash('sha256').update(JSON.stringify([process.env.MENU_PDF_BUILD ?? 'dev', ...parts])).digest('hex').slice(0, 40);

export type GuestPdf = { ok: true; theme: string; widened: number[]; pdf: string } | { ok: false };

/** Guest copies are always Classic, the style the website's menus are dressed in (Alex, 2026-11-17),
 * whatever style staff print in. */
export const GUEST_THEME = 'classic';

/** The guest copy, in Classic: two columns on a page that runs over, and if it still runs over, that page
 * split in two (up to three times). ok:false when it still won't fit, and then there's no download. */
export async function guestPdf(menu: Menu, partner?: string): Promise<GuestPdf> {
  const printMenu = guestPrintMenu(menu, partner);
  const key = fingerprint('guest', printMenu, GUEST_THEME);
  return unstable_cache(
    async (): Promise<GuestPdf> => {
      const r = await buildFirstFit(printMenu, [GUEST_THEME], { meta: pdfMeta(menu), split: 3 });
      return r.ok && r.pdf ? { ok: true, theme: r.theme, widened: r.widened, pdf: Buffer.from(r.pdf).toString('base64') } : { ok: false };
    },
    ['menu-guest-pdf', key],
    { revalidate: false },
  )();
}

const timeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, no) => setTimeout(() => no(new Error(`no answer in ${ms / 1000}s`)), ms))]);

/** Whether the menu page should offer Download PDF. Never during the build (no browser there): pages
 * refresh within five minutes and pick it up then. Any trouble means no link, never a broken page. */
export async function guestPdfReady(menu: Menu): Promise<boolean> {
  if (!downloadable(menu) || process.env.NEXT_PHASE === 'phase-production-build') return false;
  try {
    return (await timeout(guestPdf(menu), 40_000)).ok;
  } catch (e) {
    console.warn(`[menu pdf] ${menu.slug}: ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

/** For the staff print page: which styles the menu fits in as laid out (two columns where needed). */
export async function stylesThatFit(menu: Menu) {
  const printMenu = toPrintMenu(menu);
  return unstable_cache(() => checkThemes(printMenu, THEME_IDS), ['menu-print-fit', fingerprint('staff', printMenu)], { revalidate: false })();
}
