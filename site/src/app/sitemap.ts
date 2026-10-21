import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/stay', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/dine', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/celebrate', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/whats-on', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/visit', priority: 0.6, changeFrequency: 'yearly' },
  ];
  return pages.map((p) => ({ url: `${SITE_URL}${p.path}`, lastModified: new Date(), changeFrequency: p.changeFrequency, priority: p.priority }));
}
