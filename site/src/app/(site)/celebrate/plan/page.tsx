import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { VenioWidget } from '@/components/VenioWidget';
import { business } from '@/content/site';
import { photos } from '@/content/photos';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import '../celebrate.css';

export const metadata: Metadata = {
  title: 'Plan Your Event',
  description:
    'Plan a private dinner, party, wedding or group event at River Ranch in Tahoe City: see open nights in the Alpine Dining Room, send a request, and the events team gets back to you.',
  alternates: { canonical: '/celebrate/plan' },
};

export default function PlanPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Plan', '/celebrate/plan')} />
      <SiteHeader />

      {/* Venio's booking widget, full width. It's the one way in for every event request (no second form). Venio
          needs this page's address for guests who turn back at the deposit page: /celebrate/plan. */}
      <section className="section section--dark cel-planpage" aria-labelledby="plan-h">
        <div className="container">
          <div className="stack cel-planpage__copy">
            <p className="label label--accent">Plan an event</p>
            <Lines as="h1" id="plan-h" className="display-l" lines={['Let’s get it', <em key="e">on the calendar.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="200">
              Pick a night in the Alpine Dining Room and send a request. Planning something bigger, like a wedding, a buyout or the patio? There’s a
              way in for that below the calendar too.
            </p>
          </div>
          <div className="cel-planpage__widget" id="request">
            <VenioWidget />
          </div>
          <p className="planner__note cel-planpage__call">
            Rather talk it through? Email <a href={`mailto:${business.email.events}`}>{business.email.events}</a> or call{' '}
            <a href={`tel:${business.phoneE164}`}>{business.phone}</a>.
          </p>
        </div>
      </section>

      <section className="section section--snow" aria-labelledby="know-h">
        <div className="container split">
          <div className="stack cel-stack">
            <p className="label label--accent" data-reveal>Good to know</p>
            <Lines id="know-h" className="display-l" lines={['The plain', <em key="e">details.</em>]} />
            <dl className="fl-facts" data-reveal data-reveal-delay="150">
              <div><dt>Private dinners</dt><dd>13 to 50 guests in our dining rooms</dd></div>
              <div><dt>Notice</dt><dd>At least 7 days ahead for a private dinner</dd></div>
              <div><dt>Room fees</dt><dd>None for private dining; a food and beverage minimum applies</dd></div>
              <div><dt>Patio dates</dt><dd>September, and spring once the patio opens</dd></div>
            </dl>
            <div className="btn-row" data-reveal data-reveal-delay="250">
              <Link href="/celebrate/spaces" className="btn btn--ink">See the spaces</Link>
              <Link href="/celebrate#faq" className="btn btn--ghost">More questions</Link>
            </div>
          </div>
          <figure className="frame frame--tall" data-reveal>
            <Image src={photos.fireplaceTableSet.src} alt={photos.fireplaceTableSet.alt} fill sizes="(max-width: 860px) 200vw, 100vw" data-parallax="0.08" />
          </figure>
        </div>
      </section>
    </>
  );
}
