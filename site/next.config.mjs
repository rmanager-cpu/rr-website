// Redirects keep every old address working, so rankings and old links carry over (see docs/INVENTORY.md
// §6). All are 301 (permanent). Popmenu's ~247 /items/* pages fold into the menus; rrbanquets.com and
// rrweddings.com map onto /celebrate once those domains point here.
const r = (source, destination) => ({ source, destination, statusCode: 301 });

const oldSite = [
  // Stay
  r('/book-a-room', '/stay#book'),
  r('/menus/our-rooms', '/stay'),
  r('/lodge-info', '/stay'),
  r('/know-before-you-go', '/stay'),
  r('/local-activities', '/stay'),
  r('/ski-butlers', '/stay'),
  r('/files/lodgepoliciespdf-pdf.pdf', '/stay'),
  r('/files/lodge-map-pdf.pdf', '/stay'),
  r('/files/lodgemapmaster-pdf.pdf', '/stay'),
  // Dine
  r('/menus', '/dine#menus'),
  r('/menus/happy-hour', '/events/happy-hour'),
  r('/menus/weekend-breakfast', '/dine#breakfast'),
  r('/menus/merchandise', '/visit#gift-cards'),
  r('/menus/:slug', '/dine#menus'),
  r('/items/lodge-gift-certificate', '/visit#gift-cards'),
  r('/items/restaurant-gift-card', '/visit#gift-cards'),
  r('/items/:slug', '/dine#menus'),
  r('/order', '/dine'),
  // Celebrate
  r('/private-parties', '/celebrate'),
  r('/weddings', '/celebrate#weddings'),
  // What's on
  r('/live-music', '/events/summer-concert-series'),
  r('/snowfest', '/events'),
  r('/whats-on', '/events'),
  // Everything else
  r('/reviews', '/'),
  r('/love-your-lodge', '/'),
  r('/join-our-team', '/careers'),
  r('/contact', '/visit'),
];

const host = (domain, source, destination) => ({
  source,
  has: [{ type: 'host', value: `(?:www\\.)?${domain.replace('.', '\\.')}` }],
  destination: `https://www.riverranchlodge.com${destination}`,
  statusCode: 301,
});

const oldDomains = [
  host('rrbanquets.com', '/menus', '/celebrate#plan'),
  host('rrbanquets.com', '/book', '/celebrate#plan'),
  host('rrbanquets.com', '/faqs', '/celebrate#faq-h'),
  host('rrbanquets.com', '/custom-inquiry', '/celebrate#plan'),
  host('rrbanquets.com', '/ski-stay', '/stay'),
  host('rrbanquets.com', '/:path*', '/celebrate'),
  host('rrweddings.com', '/:path*', '/celebrate#weddings'),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  images: { formats: ['image/avif', 'image/webp'], deviceSizes: [390, 640, 828, 1080, 1440, 1920, 2400] },
  async redirects() {
    return [...oldDomains, ...oldSite];
  },
  async headers() {
    return [{ source: '/photos/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }];
  },
};

export default nextConfig;
