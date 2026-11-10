import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';

// The 404 sits outside the public layout, so the scroll motion (components/fl/Motion.tsx) is not mounted
// here: the hero rises in on load with the CSS keyframe instead of data-reveal (reduced motion stills it).
const rise = (ms: number): CSSProperties => ({ animation: `fs-rise var(--slow) var(--ease) ${ms}ms both` });

export default function NotFound() {
  return (
    <>
      <main id="main">
        <SiteHeader variant="overlay" />
        <section className="page-hero">
          <div className="page-hero__media">
            <Image src={photos.heroNight.src} alt={photos.heroNight.alt} fill priority sizes="100vw" />
          </div>
          <div className="page-hero__inner container">
            <p className="label label--accent" style={rise(0)}>Page not found</p>
            <h1 className="display-xl" style={rise(120)}>
              This page <em>wandered off.</em>
            </h1>
            <p className="lede" style={rise(300)}>Probably down to the river. Here’s the way back to the good stuff.</p>
            <div className="btn-row" style={rise(450)}>
              <Link href="/stay" className="btn">Stay</Link>
              <Link href="/dine" className="btn btn--ghost">Dine</Link>
              <Link href="/celebrate" className="btn btn--ghost">Celebrate</Link>
              <Link href="/" className="btn btn--ghost">Home</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
