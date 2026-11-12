import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Manrope } from 'next/font/google';
import { photos } from '@/content/photos';
import { business, SITE_URL } from '@/content/site';
import { JsonLd, organizationSchema } from '@/lib/schema';
import './globals.css';
import './menus.css';

// Fireside type: Instrument Serif (regular and italic) for display and headlines, Manrope for text and
// UI. next/font fetches both at build time and serves them from this site, so visitors never call Google.
// --font-serif is an alias of --font-display (globals.css).
const display = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], display: 'swap', variable: '--font-display' });
const sans = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });

// Scroll reveals (components/fl/Motion.tsx) hide content only under html.fl-motion. Setting the class here,
// before the first paint, lets content that is already on screen rise in without a flash. If the motion
// script has not taken over within 4 seconds (slow or failed JS), the class comes off and everything shows.
const motionBoot = `(function(){try{var r=document.documentElement;if(!window.matchMedia||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;r.classList.add('fl-motion');setTimeout(function(){if(!r.classList.contains('fl-live'))r.classList.remove('fl-motion')},4000)}catch(e){}})();`;

// The overlay header turns to glass once the page scrolls (SiteHeader). This sets html.fs-scrolled from the
// first paint, so a page that loads already scrolled, or before React hydrates, never shows cream nav text
// over a snow band. The threshold matches SiteHeader's (its data-solid-after attribute).
const headerBoot = `(function(){try{var r=document.documentElement;var c=function(){var h=document.querySelector('.site-header--overlay');var f=h?parseFloat(h.getAttribute('data-solid-after'))||0.04:0.04;r.classList.toggle('fs-scrolled',window.scrollY>Math.max(30,window.innerHeight*f))};window.addEventListener('scroll',c,{passive:true});window.addEventListener('resize',c);document.addEventListener('DOMContentLoaded',c);window.addEventListener('load',c);c()}catch(e){}})();`;

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
  themeColor: '#0e0d0b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: motionBoot + headerBoot }} />
        <a href="#main" className="skip-link">Skip to content</a>
        <JsonLd data={organizationSchema()} />
        {children}
      </body>
    </html>
  );
}
