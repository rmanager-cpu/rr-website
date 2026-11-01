import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import Image from 'next/image';
import { EventPlanner } from '@/components/EventPlanner';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Plan Your Event',
  description:
    'Plan a wedding, private dinner, party or group event at River Ranch in Tahoe City: pick a date, tell us what you’re planning, and the events team gets back to you.',
  alternates: { canonical: '/celebrate/plan' },
};

export default function PlanPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Plan', '/celebrate/plan')} />
      <SiteHeader />

      <section className="section" aria-labelledby="plan-h">
        <div className="container media-row" style={{ gap: 48, alignItems: 'flex-start' }}>
          <div className="grow stack" style={{ gap: 28 }}>
            <h1 id="plan-h" className="slash h-l">Plan your event</h1>
            <p className="lede">{L.line3}</p>
            <dl className="facts">
              <div><dt>Private dinners</dt><dd>13 to 50 guests in our dining rooms</dd></div>
              <div><dt>Notice</dt><dd>At least 7 days ahead for a private dinner</dd></div>
              <div><dt>Room fees</dt><dd>None for private dining; a food and beverage minimum applies</dd></div>
              <div><dt>Patio dates</dt><dd>Released in late winter or early spring</dd></div>
            </dl>
            <Image src={photos.fireplaceTableSet.src} alt={photos.fireplaceTableSet.alt} width={photos.fireplaceTableSet.width} height={photos.fireplaceTableSet.height} sizes="(max-width: 900px) 100vw, 720px" className="rounded" style={{ width: '100%', height: 'auto' }} />
          </div>
          <div className="side" style={{ flexBasis: 400 }}>
            <EventPlanner heading="Tell us about it" />
          </div>
        </div>
      </section>
    </>
  );
}
