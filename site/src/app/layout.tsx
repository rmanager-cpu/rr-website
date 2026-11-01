import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { photos } from '@/content/photos';
import { business, SITE_URL } from '@/content/site';
import { JsonLd, organizationSchema } from '@/lib/schema';
import './globals.css';
import './menus.css';

// The homepage's fonts on every page (docs/SITEMAP.md): Knewave brush for headings, Fraunces serif,
// Figtree sans. Self-hosted, swapped in without blocking text. Brush and serif aren't preloaded: the
// browser finds them in the CSS straight away, and the homepage preloads its own copies.
const display = localFont({ src: '../fonts/knewave-latin-400-normal.woff2', weight: '400', display: 'swap', variable: '--font-display', preload: false });
const serif = localFont({ src: '../fonts/fraunces-latin-wght-normal.woff2', weight: '100 900', display: 'swap', variable: '--font-serif', preload: false });
const sans = localFont({ src: '../fonts/figtree-latin-wght-normal.woff2', weight: '300 900', display: 'swap', variable: '--font-sans' });

const description =
  'A riverside lodge, restaurant and bar on the Truckee River in Tahoe City, minutes from Palisades Tahoe. 19 rooms, dinner nightly by the fire, happy hour and private events.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${business.name} · Tahoe City Lodge on the Truckee River`, template: `%s · River Ranch` },
  description,
  applicationName: business.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: business.name,
    locale: 'en_US',
    url: SITE_URL,
    title: `${business.name} · Tahoe City`,
    description,
    images: [{ url: photos.heroDay.src, width: photos.heroDay.width, height: photos.heroDay.height, alt: photos.heroDay.alt }],
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: true, address: true },
  // Not live on the real domain yet: keep previews out of search results until launch.
  robots: process.env.SITE_INDEXABLE === 'true' ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#101C2A',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <JsonLd data={organizationSchema()} />
        {children}
      </body>
    </html>
  );
}
