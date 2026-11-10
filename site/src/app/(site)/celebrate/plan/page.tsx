import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { EventPlanner } from '@/components/EventPlanner';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import '../celebrate.css';

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

      <section className="section section--dark cel-planpage" aria-labelledby="plan-h">
        <div className="container cel-plan__grid cel-planpage__grid">
          <div className="stack cel-planpage__copy">
            <p className="label label--accent">Plan an event</p>
            <Lines as="h1" id="plan-h" className="display-l" lines={['Let’s get it', <em key="e">on the calendar.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="200">
              It takes a minute. Tell us the date, the headcount and what you’re celebrating, and we come back with spaces and a menu.
            </p>
          </div>
          <div className="cel-planpage__form" data-reveal data-reveal-delay="150">
            <EventPlanner heading="Tell us about it" />
          </div>
          {/* The events app's live availability calendar plugs in here once it's ready. */}
          <div className="cel-planpage__cal" data-reveal data-reveal-delay="300">
            <p className="label cel-slot__label">Is your date open?</p>
            <div className="slot cel-slot">
              [Live availability calendar goes here]
              <small>Open dates from our events system will show at this spot.</small>
            </div>
          </div>
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
              <div><dt>Patio dates</dt><dd>Released in late winter or early spring</dd></div>
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
