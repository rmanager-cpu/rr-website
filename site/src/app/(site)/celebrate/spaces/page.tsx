import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SpaceGrid } from '@/components/SpaceGrid';
import { photos } from '@/content/photos';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

// Thin until capacities, layouts and photos for each space come in from management: noindex, and
// left out of the sitemap until then.
export const metadata: Metadata = {
  title: 'Event Spaces',
  description: 'The Riverview room, the Fireplace room, The Point and the full riverside patio at River Ranch in Tahoe City.',
  alternates: { canonical: '/celebrate/spaces' },
  robots: { index: false, follow: true },
};

export default function SpacesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Spaces', '/celebrate/spaces')} />
      <SiteHeader />

      <section className="section">
        <div className="container stack" style={{ gap: 44 }}>
          <div className="stack" style={{ gap: 22, maxWidth: 760 }}>
            <h1 className="slash h-l">Spaces</h1>
            <p className="lede">{L.line}</p>
          </div>
          <SpaceGrid />
          <p className="muted" style={{ margin: 0 }}>Capacities and layouts for each space are coming soon. Ask us in the meantime.</p>
          <figure className="figure">
            <Image src={photos.aerialSpaces.src} alt={photos.aerialSpaces.alt} width={photos.aerialSpaces.width} height={photos.aerialSpaces.height} sizes="(max-width: 1280px) 100vw, 1180px" className="rounded" style={{ width: '100%', height: 'auto' }} />
            <figcaption>The Riverview room over the river, the patio beside it, and The Point at its river end.</figcaption>
          </figure>
          <div className="btn-row">
            <Link href="/celebrate/plan" className="btn btn--amber">Plan your event</Link>
          </div>
        </div>
      </section>
    </>
  );
}
