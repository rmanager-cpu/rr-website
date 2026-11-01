import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Riverside Weddings in Tahoe City',
  description:
    'Ceremonies on the riverside patio, receptions, rehearsal dinners and welcome parties at River Ranch on the Truckee River, with 19 lodge rooms upstairs for your guests.',
  alternates: { canonical: '/celebrate/weddings' },
};

export default function WeddingsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Weddings', '/celebrate/weddings')} />
      <SiteHeader />

      <section className="page-hero">
        <div className="page-hero__bg">
          <Image src={photos.ceremonyAisle.src} alt={photos.ceremonyAisle.alt} fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center 60%' }} />
        </div>
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="container page-hero__body">
          <h1 className="slash h-l" style={{ color: 'var(--ice)' }}>Weddings</h1>
          <p>{L.line}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="day-h">
        <div className="container media-row" style={{ gap: 48, alignItems: 'flex-start' }}>
          <div className="grow stack" style={{ gap: 28 }}>
            <span className="eyebrow">On the river</span>
            <h2 id="day-h" className="serif h-m">{L.head2}</h2>
            <p className="lede">{L.line2}</p>
            <dl className="facts">
              <div><dt>Ceremonies</dt><dd>On the riverside patio in the warmer months, with an indoor room as the backup</dd></div>
              <div><dt>Patio dates</dt><dd>Released in late winter or early spring, depending on the weather</dd></div>
              <div><dt>Around the day</dt><dd>Rehearsal dinners, welcome parties and receptions</dd></div>
              <div><dt>Your guests</dt><dd>{business.rooms} lodge rooms upstairs</dd></div>
              <div><dt>Getting here</dt><dd>ADA accessible, with a private lot on site</dd></div>
            </dl>
          </div>
          <div className="side">
            <Image src={photos.fireplaceLongTable.src} alt={photos.fireplaceLongTable.alt} width={photos.fireplaceLongTable.width} height={photos.fireplaceLongTable.height} sizes="(max-width: 900px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="inquire-h">
        <div className="band__bg">
          <Image src={photos.patioNight.src} alt={photos.patioNight.alt} fill sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="container" style={{ width: '100%', paddingBlock: 80 }}>
          <div className="band__card">
            <span className="eyebrow">Start planning</span>
            <h2 id="inquire-h" className="serif" style={{ fontSize: 'clamp(40px, 4.6vw, 64px)', lineHeight: 0.98 }}>{L.head3}</h2>
            <p className="lede">{L.line3}</p>
            <div className="btn-row">
              <Link href="/celebrate/plan#wedding" className="btn btn--amber">Start a wedding inquiry</Link>
              <Link href="/celebrate/spaces" className="btn btn--navy">See the spaces</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
