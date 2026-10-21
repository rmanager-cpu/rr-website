import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { business, hours } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: "Happy Hour, Live Music & Events",
  description:
    'What’s happening at River Ranch in Tahoe City: happy hour Monday to Friday, weekend breakfast, dinner nightly, live music and seasonal events on the Truckee River.',
  alternates: { canonical: '/whats-on' },
};

export default function WhatsOnPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema("What's On", '/whats-on')} />
      <SiteHeader />
      <section className="section">
        <div className="container stack" style={{ gap: 28 }}>
          <span className="eyebrow">What&apos;s on</span>
          <h1 className="slash h-l">Every week at River Ranch.</h1>
          <p className="lede">The regulars, all season long. Live music, holiday dinners and special events will show up here as they’re announced.</p>
        </div>
      </section>
      <section className="section bg-frost" style={{ paddingTop: 0, background: 'transparent' }}>
        <div className="container">
          <dl className="facts">
            <div><dt>Every night</dt><dd>Dinner, {hours.dinner.time}</dd></div>
            <div><dt>Monday–Friday</dt><dd>Happy hour at the bar, {hours.happyHour.time}</dd></div>
            <div><dt>Saturday & Sunday</dt><dd>Breakfast, {hours.breakfast.time}</dd></div>
            <div><dt>Private events</dt><dd><Link href="/celebrate">Plan a dinner or party</Link></dd></div>
          </dl>
        </div>
      </section>
      <section className="section on-night">
        <div className="container stack" style={{ gap: 18, maxWidth: 820 }}>
          <h2 className="serif h-s">Hear about events first.</h2>
          <p className="lede">Follow along on <a href={business.social.instagram} rel="noopener">Instagram</a> and <a href={business.social.facebook} rel="noopener">Facebook</a> for live music and specials.</p>
        </div>
      </section>
    </>
  );
}
