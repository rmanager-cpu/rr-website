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
      <SiteHeader variant="overlay" />

      {/* The top of the page: the Alpine Dining Room by the fireplace, full-bleed, with the rrbanquets.com line over it and
          Venio's booking widget sitting on the photo below. The widget is the one way in for every event request (no second
          form). Venio needs this page's address for guests who turn back at the deposit page: /celebrate/plan. */}
      <section className="cel-planhero" aria-labelledby="plan-h">
        <div className="cel-planhero__media">
          <Image src={photos.fireplaceTableSet.src} alt={photos.fireplaceTableSet.alt} fill priority sizes="100vw" />
        </div>
        <div className="container cel-planhero__inner">
          <div className="stack cel-planpage__copy">
            <p className="label label--accent">Private dining</p>
            <Lines as="h1" id="plan-h" className="display-l" lines={['A smarter way to book', <em key="e">private dining.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="200">
              Easy enough to do on a chairlift. Pick a night, send a request, and get back to enjoying Tahoe. Our events team follows up on your
              time to go over the rest. Cheers.
            </p>
          </div>
          <div className="cel-planpage__widget" id="request">
            <VenioWidget />
          </div>
          <p className="planner__note cel-planpage__call">
            Planning a wedding, a buyout or the patio? Use “Planning something bigger?” in the calendar, email{' '}
            <a href={`mailto:${business.email.events}`}>{business.email.events}</a> or call <a href={`tel:${business.phoneE164}`}>{business.phone}</a>.
          </p>
        </div>
      </section>

      <section className="section section--snow" aria-labelledby="know-h">
        <div className="container">
          <div className="stack cel-stack cel-know">
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
        </div>
      </section>
    </>
  );
}
