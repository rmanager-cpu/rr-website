import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { SpaceGrid } from '@/components/SpaceGrid';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import '../celebrate.css';

// Thin until capacities, layouts and photos for each space come in from management: noindex, and
// left out of the sitemap until then.
export const metadata: Metadata = {
  title: 'Event Spaces',
  description: 'The Riverview room, the Alpine Dining Room, The Point (the Half Patio) and the full riverside patio at River Ranch in Tahoe City.',
  alternates: { canonical: '/celebrate/spaces' },
  robots: { index: false, follow: true },
};

export default function SpacesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Spaces', '/celebrate/spaces')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero cel-hero--night">
        <div className="page-hero__media">
          <Image src={photos.heroDawn.src} alt={photos.heroDawn.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Spaces</p>
          <Lines as="h1" className="display-l" lines={['Four places', <em key="e">to throw it.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">
            A round room over the river, a room with a stone fireplace, the river end of the patio, or the whole patio.
          </p>
        </div>
      </section>

      <section className="section section--snow" aria-label="The spaces">
        <div className="container">
          <SpaceGrid />
        </div>
      </section>

      <section className="section section--frost" aria-labelledby="map-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>From above</p>
            <Lines id="map-h" className="display-l" lines={['How it all', <em key="e">fits together.</em>]} />
          </div>
          <figure className="frame frame--wide" data-reveal="clip">
            <Image src={photos.aerialSpaces.src} alt={photos.aerialSpaces.alt} fill sizes="(max-width: 1440px) 100vw, 1320px" />
          </figure>
          <p className="label cel-aerial__cap" data-reveal>The Riverview room over the river, the patio beside it, and The Point at its river end.</p>
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="ask-h">
        <div className="container container--narrow">
          <div className="section-head section-head--center" style={{ marginBottom: 0 }}>
            <p className="label label--accent" data-reveal>Ask us</p>
            <Lines id="ask-h" className="display-l" lines={['Not sure', <em key="e">which one fits?</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">
              Capacities for the other spaces, and layouts for all of them, are coming soon. Tell us the headcount and we’ll point you to the right room.
            </p>
            <div className="btn-row" data-reveal data-reveal-delay="250" style={{ justifyContent: 'center' }}>
              <Link href="/celebrate/plan" className="btn">Plan your event</Link>
              <a href={`mailto:${business.email.events}`} className="btn btn--ghost">Email the events team</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
