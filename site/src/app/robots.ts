import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/content/site';

// Until launch on the real domain, previews stay out of search engines (SITE_INDEXABLE=true at launch).
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_INDEXABLE !== 'true') return { rules: [{ userAgent: '*', disallow: '/' }] };
  return { rules: [{ userAgent: '*', allow: '/', disallow: '/admin' }], sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
