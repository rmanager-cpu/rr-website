import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/content/site';
import { listPages } from '@/lib/events/store';
import { dishHasPage, listMenus } from '@/lib/menus/store';

// Indexable pages only: placeholders (Wine, Order online, Spaces, empty event pages) are left out until
// they have content, matching their noindex tags.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const fixed: [string, number, MetadataRoute.Sitemap[number]['changeFrequency']][] = [
    ['/', 1, 'weekly'],
    ['/stay', 0.9, 'monthly'],
    ['/stay/rooms', 0.8, 'monthly'],
    ['/stay/packages', 0.8, 'monthly'],
    ['/stay/guest-info', 0.7, 'monthly'],
    ['/dine', 0.9, 'weekly'],
    ['/dine/menus', 0.9, 'weekly'],
    ['/dine/happening', 0.8, 'daily'],
    ['/celebrate', 0.9, 'monthly'],
    ['/celebrate/weddings', 0.8, 'monthly'],
    ['/celebrate/plan', 0.8, 'monthly'],
    ['/history', 0.6, 'monthly'],
    ['/loyalty-and-gift-cards', 0.5, 'yearly'],
    ['/careers', 0.5, 'monthly'],
    ['/visit', 0.6, 'yearly'],
    ['/privacy', 0.2, 'yearly'],
  ];
  const pages = (await listPages()).filter((p) => p.layout !== 'standard' || p.body?.trim() || p.summary?.trim());
  const menus = await listMenus();
  // Signature dish pages: only dishes with a page (ticked and with a story), once each, on a menu on the site.
  const dishes = new Set(menus.filter((m) => m.kind !== 'banquet').flatMap((m) => m.sections.flatMap((s) => s.items.filter((i) => !i.hidden && dishHasPage(i.dish)).map((i) => i.dish.slug))));
  return [
    ...menus.map((m) => ({ url: `${SITE_URL}/dine/menus/${m.slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...[...dishes].map((slug) => ({ url: `${SITE_URL}/dine/menus/dishes/${slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...fixed.map(([path, priority, changeFrequency]) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority })),
    ...pages.map((p) => ({ url: `${SITE_URL}/dine/happening/${p.slug}`, lastModified: p.updatedAt ? new Date(p.updatedAt) : now, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
