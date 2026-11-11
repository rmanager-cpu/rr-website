// Redirects keep every old address working, so rankings and old links carry over (see docs/INVENTORY.md
// §6). All are 301 (permanent). Popmenu's ~247 /items/* pages fold into the menus; rrbanquets.com and
// rrweddings.com map onto /celebrate once those domains point here. Every rule points at the final page,
// so nothing redirects twice.
import { readFileSync } from 'node:fs';

const itemRedirects = JSON.parse(readFileSync(new URL('./src/content/item-redirects.json', import.meta.url), 'utf8'));
const r = (source, destination) => ({ source, destination, statusCode: 301 });

const oldSite = [
  // Stay
  r('/book-a-room', '/stay#book'),
  r('/menus/our-rooms', '/stay/rooms'),
  r('/lodge-info', '/stay/guest-info'),
  r('/know-before-you-go', '/stay/guest-info'),
  r('/local-activities', '/stay/guest-info#nearby'),
  r('/ski-butlers', '/stay/packages'),
  r('/files/lodgepoliciespdf-pdf.pdf', '/stay/guest-info'),
  r('/files/lodge-map-pdf.pdf', '/stay/rooms'),
  r('/files/lodgemapmaster-pdf.pdf', '/stay/rooms'),
  // Dine. The old Popmenu menu addresses (/menus/dinner etc.) keep their slugs under /dine/menus.
  r('/menus/merchandise', '/loyalty-and-gift-cards'),
  r('/menus/mothers-day-brunch-2022', '/dine/menus'),
  // Tuesday Dinner was a short-lived menu from one lean year; dinner is the same menu every night.
  r('/menus/tuesday-dinner-menu', '/dine/menus/dinner'),
  r('/dine/menus/tuesday-dinner-menu', '/dine/menus/dinner'),
  r('/items/lodge-gift-certificate', '/loyalty-and-gift-cards'),
  r('/items/restaurant-gift-card', '/loyalty-and-gift-cards'),
  ...Object.entries(itemRedirects).map(([dish, menu]) => r(`/items/${dish}`, `/dine/menus/${menu}`)),
  r('/items/:slug', '/dine/menus'),
  r('/live-music', '/dine/happening/summer-concert-series'),
  r('/snowfest', '/dine/happening'),
  r('/whats-on', '/dine/happening'),
  // Celebrate
  r('/private-parties', '/celebrate'),
  r('/weddings', '/celebrate/weddings'),
  // Everything else
  r('/reviews', '/'),
  r('/love-your-lodge', '/'),
  r('/join-our-team', '/careers'),
  r('/contact', '/visit'),
];

// Pages that moved when the site map changed (docs/SITEMAP.md, 2026-10-31).
const moved = [
  r('/menus', '/dine/menus'),
  r('/menus/dishes/:slug', '/dine/menus/dishes/:slug'),
  r('/menus/:slug', '/dine/menus/:slug'),
  r('/order', '/dine/menus/order'),
  r('/events', '/dine/happening'),
  r('/events/:slug', '/dine/happening/:slug'),
  r('/johanson-family-wine', '/dine/wine'),
  r('/loyalty', '/loyalty-and-gift-cards'),
  r('/gift-cards', '/loyalty-and-gift-cards'),
];

const host = (domain, source, destination) => ({
  source,
  has: [{ type: 'host', value: `(?:www\\.)?${domain.replace('.', '\\.')}` }],
  destination: `https://www.riverranchlodge.com${destination}`,
  statusCode: 301,
});

const oldDomains = [
  host('rrbanquets.com', '/menus', '/celebrate/plan#private'),
  host('rrbanquets.com', '/book', '/celebrate/plan#private'),
  host('rrbanquets.com', '/faqs', '/celebrate#faq-h'),
  host('rrbanquets.com', '/custom-inquiry', '/celebrate/plan'),
  host('rrbanquets.com', '/ski-stay', '/stay/packages'),
  host('rrbanquets.com', '/:path*', '/celebrate'),
  host('rrweddings.com', '/:path*', '/celebrate/weddings'),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'playwright-core', 'pdf-lib'],
    // Read at run time by the menu PDF route.
    outputFileTracingIncludes: { '/admin/print/menus/*/pdf': ['./print-fonts/**', './src/lib/print-menu/fit.js'] },
  },
  trailingSlash: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 828, 1080, 1440, 1920, 2400],
    remotePatterns: [{ protocol: 'https', hostname: 'images.bookingcenter.com', pathname: '/RIVERR/images/**' }],
  },
  async redirects() {
    return [...oldDomains, ...oldSite, ...moved];
  },
  async headers() {
    return [{ source: '/photos/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }];
  },
};

export default nextConfig;
