import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

// Placeholder until the story is written. Kept out of Google (noindex) so a thin page doesn't count
// against the site; flip `index` when there's real content.
export const metadata: Metadata = {
  title: 'Johanson Family Wine',
  description: 'Johanson Family Wine at River Ranch Lodge & Restaurant, Tahoe City.',
  alternates: { canonical: '/johanson-family-wine' },
  robots: { index: false, follow: true },
};

export default function JohansonPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Johanson Family Wine', '/johanson-family-wine')} />
      <SiteHeader />
      <section className="section">
        <div className="container media-row" style={{ gap: 48, alignItems: 'center' }}>
          <div className="grow stack" style={{ gap: 22 }}>
            <span className="eyebrow">On our wine list</span>
            <h1 className="slash h-l">Johanson Family Wine.</h1>
            <p className="lede">The full story is coming soon.</p>
          </div>
          <div className="side">
            <Image src="/photos/johanson-estate-cabernet.jpg" alt="A bottle of Johanson Estate Cabernet Sauvignon 2021 beside a glass of red" width={1080} height={1350} sizes="(max-width: 900px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>
    </>
  );
}
