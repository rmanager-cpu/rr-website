// Redirects keep every old address working, so rankings and old links carry over (see docs/INVENTORY.md
// §6). All are 301 (permanent). Popmenu's ~247 /items/* pages fold into the menus. Every rule points at
// the final page, so nothing redirects twice.
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
  // Popmenu listed the rooms as menu items too (/items/2-queens-over-patio?menu=our-rooms).
  { source: '/items/:slug', has: [{ type: 'query', key: 'menu', value: 'our-rooms' }], destination: '/stay/rooms', statusCode: 301 },
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

// No other domains forward here (Alex, 2026-11-12): rrbanquets.com and rrweddings.com were Popmenu-era
// workarounds and are being let go.

// Read at run time by everything that lays out a menu PDF. Chromium's bin/ (the compressed browser) is loaded by
// path, so the tracer never sees it: without it every print on Vercel failed with "…/chromium/bin does not exist".
const PRINT_FILES = ['./print-fonts/**', './print-assets/**', './src/lib/print-menu/fit.js', './node_modules/@sparticuz/chromium/bin/**'];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Menu PDFs are remembered per build (lib/menus/pdf.ts), so a new build never serves an old layout.
  env: { MENU_PDF_BUILD: String(Date.now()) },
  experimental: {
    // The Careers form posts a resume of up to 4 MB.
    serverActions: { bodySizeLimit: '5mb' },
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'playwright-core', 'pdf-lib'],
    // Keys match route names that contain them ("?" is any one character, standing in for the brackets):
    //   /admin/print/menus/[slug] and its /pdf   (staff: which styles fit, the print PDF)
    //   /dine/menus/[slug] and its /pdf          (guests: is there a PDF, Download PDF)
    outputFileTracingIncludes: {
      '/admin/print/menus/?slug?': PRINT_FILES,
      '/dine/menus/?slug?': PRINT_FILES,
    },
  },
  trailingSlash: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 828, 1080, 1440, 1920, 2400],
    remotePatterns: [{ protocol: 'https', hostname: 'images.bookingcenter.com', pathname: '/RIVERR/images/**' }],
  },
  async redirects() {
    return [...oldSite, ...moved];
  },
  async headers() {
    return [{ source: '/photos/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }];
  },
};

export default nextConfig;
