import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/content/site';
import { listPages } from '@/lib/events/store';
import { listMenus } from '@/lib/menus/store';

// Indexable pages only: placeholders (Loyalty, Johanson, empty event pages) are left out until they
// have content, matching their noindex tags.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const fixed: [string, number, MetadataRoute.Sitemap[number]['changeFrequency']][] = [
    ['/', 1, 'weekly'],
    ['/stay', 0.9, 'monthly'],
    ['/dine', 0.9, 'weekly'],
    ['/celebrate', 0.9, 'monthly'],
    ['/events', 0.8, 'daily'],
    ['/menus', 0.9, 'weekly'],
    ['/history', 0.6, 'monthly'],
    ['/careers', 0.5, 'monthly'],
    ['/visit', 0.6, 'yearly'],
  ];
  const pages = (await listPages()).filter((p) => p.layout !== 'standard' || p.body?.trim() || p.summary?.trim());
  const menus = await listMenus();
  return [
    ...menus.map((m) => ({ url: `${SITE_URL}/menus/${m.slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...fixed.map(([path, priority, changeFrequency]) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority })),
    ...pages.map((p) => ({ url: `${SITE_URL}/events/${p.slug}`, lastModified: p.updatedAt ? new Date(p.updatedAt) : now, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
